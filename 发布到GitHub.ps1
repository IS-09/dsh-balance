# 发布 dsh-balance 到 GitHub（账号 IS-09）
# 前置：任选一种认证方式
#   A) SSH（推荐）：把 id_ed25519_dsh.pub 内容添加到 GitHub → Settings → SSH and GPG keys
#   B) gh CLI：winget install GitHub.cli && gh auth login
#   C) HTTPS PAT：在 GitHub 生成 token 后设置环境变量 $env:GITHUB_TOKEN
$ErrorActionPreference = 'Stop'
$repo = 'D:\AI工作区\06-dsh-balance'
$github = 'github.com'
$owner = 'IS-09'
$name = 'dsh-balance'

Write-Output "== 1) 创建远端仓库 $owner/$name =="
$created = $false
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh repo create "$owner/$name" --public --source $repo --push 2>&1
  $created = $LASTEXITCODE -eq 0
} elseif ($env:GITHUB_TOKEN) {
  $h = @{ Authorization = "Bearer $env:GITHUB_TOKEN"; Accept = 'application/vnd.github+json' }
  try {
    Invoke-RestMethod -Method Post -Uri "https://api.github.com/user/repos" -Headers $h -ContentType 'application/json' -Body (@{ name = $name; description = 'Live DeepSeek open-platform balance for DSH Web (composer dock, green, 60s refresh)' } | ConvertTo-Json) | Out-Null
    $created = $true
    Write-Output '仓库已通过 API 创建'
  } catch { Write-Output "API 创建失败: $($_.Exception.Message)" }
} else {
  Write-Output "未检测到认证。请先完成其一："
  Write-Output "  A) ssh-keygen 公钥已生成：$env:USERPROFILE\.ssh\id_ed25519_dsh.pub"
  Write-Output "     → 在 github.com/settings/keys 添加后重跑本脚本（自动走 SSH）"
  Write-Output "  B) winget install GitHub.cli; gh auth login"
  Write-Output "  C) 设置 \$env:GITHUB_TOKEN"
}

if (-not $created) {
  Write-Output '== 手动创建仓库后继续 =='
  Write-Output "在浏览器打开 https://github.com/new ，创建空仓库 $name （不要勾选 README），然后按下面命令推送："
}

Write-Output '== 2) 推送 ================'
Push-Location $repo
try {
  if (-not (git remote | Select-String '^origin$')) {
    # 优先 SSH；SSH 不可用时退回 https（需 PAT）
    git remote add origin "git@$github`:$owner/$name.git"
  }
  git push -u origin main 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Output 'SSH 推送失败，尝试 https（需要 GITHUB_TOKEN 或 GCM 凭据）...'
    git remote set-url origin "https://$github/$owner/$name.git"
    git push -u origin main 2>&1
  }
} finally {
  Pop-Location
}
Write-Output '== 完成。安装方式：dsh plugin --profile web add github:IS-09/dsh-balance =='

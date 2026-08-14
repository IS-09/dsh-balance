# Changelog

本插件所有用户可见变更均记录于此。版本号遵循语义化版本（SemVer）。

## [0.1.2] - 2026-08-14

### Added / 新增
- **实时跟随对齐**：统计行（输入/输出 token）是居中布局，token 数字变化会让"输入"条目左右漂移。
  新增 MutationObserver（监听 dock 容器子树 DOM 变更）+ requestAnimationFrame 合并重测，
  另加 2 秒兜底轮询——余额行的"余"字**始终实时对齐**统计行的"输"字，肉眼无滞后。

### Changed / 变更
- 对齐测量从"仅挂载时 + 窗口缩放时"升级为"持续监听 + 周期兜底"。

## [0.1.1] - 2026-08-14

### Added / 新增
- **"余"↔"输" 对齐**：测量统计行中以"输入"/"Input"开头的 token span 的左边缘，
  作为余额行的 `paddingLeft`，使 `余额` 与 `输入` 首字垂直对齐（zh/en 双语言匹配）。

### Changed / 变更
- 余额行由右对齐改为左对齐跟随（`textAlign: left` + 动态 `paddingLeft`）。

## [0.1.0] - 2026-08-14

### Added / 新增（首个发布）
- **Host 半区**：`GET /api/dsh-balance` 路由——读取 `~/.dsh/.credentials.yaml` 的
  `DEEPSEEK_API_KEY`，调用 DeepSeek 开放平台官方 `GET https://api.deepseek.com/user/balance`，
  返回 `{ ok, balance, currency, granted, toppedUp, isAvailable }`（15s 超时、失败返回 502）。
- **Browser 半区**：注册进 `conversation.composer.dock` 槽位（order 1，官方统计行之后），
  渲染绿色 `余额 ¥X`（`#22c55e`，右对齐，12px，等宽数字），每 60 秒自动刷新；
  加载中/请求失败显示灰色 `余额 --`，自动恢复。
- **零核心改动**：不修改任何 DSH 官方包，纯插件实现，升级 DSH 不会丢失功能。
- 支持中英文界面（locale 字典 zh/en）。
- BSD-3-Clause 许可。

## 安装方式

```sh
# GitHub 源
dsh plugin --profile web add github:IS-09/dsh-balance
```

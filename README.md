# dsh-balance

Live **DeepSeek open-platform balance** for the DeepSeek Harness (DSH) Web GUI.
Shows your remaining balance under the composer stats line, **green**, refreshed every **60 seconds**.

DSH Web 底栏实时显示 **DeepSeek 开放平台余额**：绿色 `余额 ¥X`，每 60 秒自动刷新。

## Features / 功能

- Reads the API key from `~/.dsh/.credentials.yaml` (`DEEPSEEK_API_KEY`) — the same store `dsh web` already uses.
- Calls the official `GET https://api.deepseek.com/user/balance` endpoint (no third-party service).
- Renders as its own item in the `conversation.composer.dock` slot — **no core-package patching**, survives DSH updates.
- Gray `余额 --` while loading or when the API is unreachable; recovers automatically on the next tick.
- Host route: `GET /api/dsh-balance` (JSON: `{ ok, balance, currency, granted, toppedUp, isAvailable }`).

## Install / 安装

### From GitHub (this repo)

```sh
dsh plugin --profile web add github:IS-09/dsh-balance
```

### From npm (once published)

```sh
dsh plugin --profile web add dsh-balance
```

Then **restart** `dsh web` (or `dsh --profile <name> web`). The balance line appears under the
input/output-token stats line in the bottom bar.

## Configuration / 配置

No configuration needed. The plugin looks up the key in:

```
~/.dsh/.credentials.yaml   →   DEEPSEEK_API_KEY: sk-...
```

On Windows that is `C:\Users\<you>\.dsh\.credentials.yaml`.

## Layout / 样式

- Green `#22c55e`, right-aligned, 12px, `tabular-nums`.
- Failure state: gray `余额 --`.
- Want it left-aligned / centered / different color? Adjust `style` in `lib/client.js`
  (`BalanceLine`) — one place.

## Development / 开发

```sh
# Local install from a checkout (pnpm-link style)
dsh plugin --profile web add "link:D:/path/to/dsh-balance"

# Host route smoke test
curl http://127.0.0.1:3080/api/dsh-balance
```

## License

BSD-3-Clause © 2026 IS-09

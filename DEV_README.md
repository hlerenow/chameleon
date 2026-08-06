# chameleon

## 环境要求

| 工具    | 版本要求 | 推荐版本                       |
| ------- | -------- | ------------------------------ |
| Node.js | `>=22`   | `22.21.1`                      |
| npm     | `>=10`   | `10.9.4`（随 Node.js 22 提供） |
| pnpm    | `>=9`    | `10.32.1`                      |

项目使用 `pnpm` 管理依赖；`npm` 仅用于随 Node.js 安装和版本校验，不要使用 `npm install`。

## 开发步骤

### 1. 初始化运行时

```shell
nvm install 22
nvm use
```

确认版本：

```shell
node --version
npm --version
pnpm --version
```

### 2. 安装依赖并构建

```shell
pnpm install
pnpm run build
```

### 3. 启动 Engine 开发服务

```shell
pnpm --filter @chamn/engine start
```

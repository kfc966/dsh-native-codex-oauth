# dsh-native-codex-oauth

[English](README.md) | 简体中文

为 DeepSeek Harness 内置的 `openai-codex` provider 添加原生 ChatGPT 登录控件。只安装这一个插件，就会同时获得 Host authorization 控制器、生成的 Remote 描述符以及 Models 页 Web UI；插件不会修改 Harness agent loop，也不会替换其 LLM 适配器。

## 为什么这个插件很小

DeepSeek Harness 已经拥有关键能力：

- `llm-pi-ai` 注册 `openai-codex` 模型目录、发送模型请求并刷新 grant；
- `credentials` 在 Host 保存 grant，只暴露不含值的记录状态；
- `authorization` 管理每个 credential key 同时只有一次登录尝试的生命周期。

本插件只把这些原生 seam 接到 Web Models 页面。它不会创建第二套 Codex adapter，不会复制 `~/.codex/auth.json`，也不会把 OAuth token 存进浏览器状态。

## 兼容性

当前 alpha 面向 DeepSeek Harness `0.1.2-alpha.3` 源码线，已在 commit `dd6322d604e00eec1ba5e0c8541159906a21094a` 上验证。它依赖该源码线新增的 `settings.models.provider-card` slot 与 `llm-pi-ai` authorization flow；缺少任一能力的已发布 `0.1.0-rc.x` 版本不受支持。

## 安装

把仓库安装进 Web profile，重启 `dsh web`，然后进入 **设置 → 模型 → 添加提供方 → OpenAI Codex**：

```sh
dsh plugin --profile web add github:kfc966/dsh-native-codex-oauth
dsh web
```

点击 **Sign in with ChatGPT**，完成 provider 自己的 OAuth 流程，保存 provider，再从普通模型选择器中选择 Codex 模型。

安装本地 checkout：

```sh
dsh plugin --profile web add /absolute/path/to/dsh-native-codex-oauth
```

移除插件：

```sh
dsh plugin --profile web remove dsh-native-codex-oauth
```

## 安全属性

- 浏览器只会收到 flow 标签、prompt、notice 与不含值的 credential 状态。
- OAuth grant 始终留在 Harness Host credential service 中。
- secret prompt 使用密码输入框，回答只能提交给当前精确的 opaque prompt id。
- 退出登录通过 Host service 删除本插件拥有的 credential record。

插件使用所安装 Harness/pi-ai 版本提供的 provider flow。用户仍需自行确认账号资格并遵守适用的提供方条款。

## 分发方式

仓库提交预构建的 `lib/`，且没有安装期 lifecycle script，因此从 Git 安装不会请求 `allowBuilds` 权限。`src/` 用于源码审查；生成的 Typert 描述符和浏览器 closure bundle 一并提交到 `lib/`，保证安装包自包含。

## 开发

```sh
npm run verify
npm test
npm pack --dry-run
```

源码与生成产物当前跟随上述兼容 commit。Harness 的 Remote 或浏览器 module contract 变化时，应从兼容的 Harness checkout 重新生成 Typert 与 Client 产物。

## 许可证

MIT

# 环境搭建与交接指南

GenV4 的开发环境从零搭建指南。适用于新电脑交接、新同事入职。

## 前置条件（全新电脑从零安装）

以下按一台干净的 macOS 从零搭环境的顺序排列，逐项执行即可。

### 1. Homebrew（macOS 包管理器，后续工具的基础）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Apple Silicon (M 系列) 安装后按提示把 brew 加入 PATH:
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
brew --version   # 验证
```

### 2. Git + GitHub 认证

```bash
xcode-select --install   # 弹窗安装命令行工具,自带 git
git --version
```

推荐用 GitHub CLI 做 GitHub 认证（私有仓库 clone/push 一路无阻，比手工管理 PAT 省事）：

```bash
brew install gh
gh auth login    # 选 GitHub.com → HTTPS → Login with a web browser
```

配置提交身份（邮箱建议与 GitHub 账号绑定邮箱一致，提交才能关联到头像）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 3. Node.js（经 nvm 安装，可多版本切换）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# 重开终端(或 source ~/.zshrc)后:
nvm install 20          # catalog 的 engines 声明 20.x,装 20 最稳
nvm alias default 20
node -v && npm -v       # 验证
```

> Node 22/24 实测也可用（v0.0.1 即在 Node 24 上构建发布），npm 只会对 engines 不匹配发警告，不拦截。

### 4. npm 源注意事项（国内网络）

- 安装依赖可以走镜像加速：`npm config set registry https://registry.npmmirror.com`
- **发布必须走官方源**：`npm publish` 前确认 `npm config get registry` 返回 `https://registry.npmjs.org`，否则发布会失败
- 访问 GitHub / npmjs.org 如需代理，确认终端代理已生效（`git config --global http.proxy` 或环境变量）

### 5. npm 账号（发布用）

需有 `genv4` 包的发布权限：在新电脑执行 `npm login`（浏览器登录），首次 publish 前用 `npm whoami` 确认身份。CI 发布不依赖本机登录，见下文。

### 6. 编辑器（可选）

VSCode 打开仓库根目录即可，仓库自带的 `.vscode/settings.json` 已关闭保存时自动格式化（保持上游代码风格、避免 diff 噪音）。推荐安装 Lit 插件（`lit.lit-plugin`）获得组件开发的类型提示。

## 搭建步骤

```bash
# 1. 克隆（私有仓库，需 GitHub 访问权限）
git clone https://github.com/bingomaha-creator/GenV4.git
cd GenV4

# 2. 安装依赖（根包 + catalog workspace 一次装齐）
npm install

# 3. 安装测试浏览器（一次性）
npx playwright install chromium

# 4. 首次构建 + 测试，确认基线全绿
npm run build
npm test
```

## 仓库结构速览

| 目录 | 内容 |
|---|---|
| `button/`、`checkbox/` 等组件目录 | **源码**（`.ts` / `.scss`）与**编译产物**（`.js` / `.d.ts` / `.css`）同目录混放，靠扩展名区分。产物由构建生成，不进 git |
| `tokens/` | 设计 token 的 Sass 源码（组件样式的唯一真源） |
| `catalog/` | 文档站（Eleventy + esbuild），本地预览用，不发布到 npm |
| `docs/` | 面向使用方的文档（Markdown） |
| `labs/` | 实验性组件（会随包发布） |
| `scripts/` | 构建脚本（css-to-ts、manifest 生成等） |
| `migrations/` | 上游遗留的迁移 codemod |

**产物识别**：`*.js`、`*.js.map`、`*.d.ts`、`*.css`、`*.cssresult.ts`、`custom-elements.json`、`*-meta.scss` 均为生成物（见 `.gitignore`），可随时删除后 `npm run build` 重建。

## 日常开发流程

改组件源码（`.ts` / `.scss`）后在 catalog 中预览，**双终端模式**：

```bash
# 终端 A：起文档站（http://localhost:8000）
cd catalog && npm run serve:dev

# 终端 B：改完源码后重新构建（wireit 增量级联，浏览器自动刷新）
cd catalog && npm run build:dev
```

注意：`npm run dev`（watch 模式）在部分机器上存在 wireit service 反复重启的问题，双终端模式是稳定的替代方案。

**交互 demo 的已知限制**：catalog 页面里的交互式 playground demo 从 unpkg 加载**已发布的** genv4 包，不反映本地未发布的改动。本地改动的效果看文档页正文中的静态示例（SSR 渲染，走本地源码）。

## 构建、测试与发布

```bash
npm run build     # 构建：Sass → CSS → cssresult.ts → tsc → custom-elements.json
npm test          # Playwright + jasmine，92 个文件 1700+ 用例
```

发布到 npm：

- **手动**：`npm publish`（`prepack` 钩子会自动执行完整构建，防止发出空包）
- **CI**：推送 `v*` 标签触发 `.github/workflows/publish.yml`。
  前置配置：npmjs.com 生成 **Automation** 类型 token → 仓库 Settings → Secrets → Actions → `NPM_TOKEN`；仓库 Actions 需为开启状态
- 版本号手动管理（`npm version patch` 或手改 `package.json`），同一版本号不可重复发布

## 与上游（Google material-web）同步

```bash
git fetch upstream                    # 只下载，不动本地代码
git log --oneline main..upstream/main # 看上游新增了什么
git cherry-pick <commit>              # 按需摘取修复（推荐只挑安全/bug修复）
```

`company-baseline` 标签 = fork 起点，`git diff company-baseline..main --stat` 可随时回答"我们改了什么"。

## 遗留决策（待定）

- [ ] 交互 demo 的 import 是否从 `@material/web` 切到 `genv4`（catalog/stories/components/ 及各组件 demo/）
- [ ] `labs/` 实验组件是否继续随包发布
- [ ] `md-` 标签前缀是否保留（保留则无法与官方 @material/web 同页共存）
- [ ] npm 从个人账号迁移到公司 registry 时的包名与配置调整

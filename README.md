# GenV4

GenV4 是基于 Google [Material Web](https://github.com/material-components/material-web)（`@material/web` v2.5.0+）二次开发的 Web Components 组件库，使用 [Lit](https://lit.dev/) 构建，遵循 Material Design 3 规范。

> 内部二开版本，仅供公司内部项目使用。

## 安装

```bash
npm install genv4
```

## 快速上手

```html
<script type="module">
  import 'genv4/button/filled-button.js';
  import 'genv4/icon/icon.js';
</script>

<md-filled-button>
  <md-icon slot="icon">favorite</md-icon>
  Button
</md-filled-button>
```

按需引入各组件模块（如 `genv4/button/filled-button.js`），也可从 `genv4/all.js` 一次性引入全部组件。

## 主题定制

组件通过 CSS 自定义属性（design tokens）定制，推荐覆盖系统级 token：

```css
md-filled-button.brand {
  --md-sys-color-primary: #006a6a;
  --md-sys-color-on-primary: #ffffff;
}
```

完整 token 列表见各组件源码目录 `tokens/_md-comp-*.scss`，使用说明见 Material Web 官方文档的 [Theming](https://material-web.dev/theming/) 章节。

## 本地开发

```bash
npm install            # 安装依赖（含 catalog workspace）
npm run build          # 构建（TS + Sass + manifest）
npm test               # 运行测试（首次需 npx playwright install chromium）
```

组件文档站（catalog）：

```bash
cd catalog
npm run serve:dev      # 终端 A：起服务 http://localhost:8000
npm run build:dev      # 终端 B：改完组件源码后重新构建，浏览器自动刷新
```

详细环境搭建见 [SETUP.md](./SETUP.md)。

## 与上游的关系

本仓库 fork 自 `material-components/material-web`，`company-baseline` 标签标记了 fork 起点。上游的修复可通过以下方式同步：

```bash
git fetch upstream
git log --oneline main..upstream/main   # 查看上游新提交
git cherry-pick <commit>                # 按需摘取
```

## License

Apache-2.0。基于 Google 的 Material Web 二次开发，遵循其原始许可条款。

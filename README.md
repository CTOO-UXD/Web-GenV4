# GenV4

GenV4 是基于 Google [Material Web](https://github.com/material-components/material-web)（`@material/web` v2.5.0+）二次开发的 Web Components 组件库，使用 [Lit](https://lit.dev/) 构建，遵循 Material Design 3 规范。

> 内部二开版本，仅供公司内部项目使用。

## 安装

```bash
npm install genv4
```

当前 npm 上的版本是 `0.0.1`，还不包含此后提交的改动。要看最新代码，请克隆本仓库。

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

默认色阶在 `tokens/genv4/_ref-palette.scss`，系统颜色和档位的对应在 `tokens/genv4/_sys-color-scheme.scss`。浅色和暗色共用这一套色阶，只是各角色取的档不同。

系统 token 的浅色默认值和使用方式见 [主题](./docs/theme.md)。某个组件具体有哪些变量，见该组件文档的主题表。

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

## License

Apache-2.0。基于 Google 的 Material Web 二次开发，遵循其原始许可条款。

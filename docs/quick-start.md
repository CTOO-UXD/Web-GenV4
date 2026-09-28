<!-- catalog-only-start --><!-- ---
name: 快速开始
title: 快速开始
order: 1
-----><!-- catalog-only-end -->

# 快速开始

## 安装

用 [npm 和 Node.js](https://nodejs.org)<!-- {.external} --> 安装。

```shell
npm install genv4
```

## 引入

从 `genv4/<组件>/<组件变体>.js` 引入组件定义。

```js
// index.js
import 'genv4/button/filled-button.js';
import 'genv4/button/outlined-button.js';
import 'genv4/checkbox/checkbox.js';
```

## 使用

在 HTML 里使用组件标签。每个组件怎么用，从左侧 Components 里点进对应的文档，例如[按钮](/components/button/)。

```html
<script type="module" src="./index.js"></script>

<label>
  确认
  <md-checkbox checked></md-checkbox>
</label>

<md-outlined-button>返回</md-outlined-button>
<md-filled-button>下一步</md-filled-button>
```

项目如果已经用 Vite、webpack 这类工具打包，它们会解析上面的 `genv4/...` 路径。只有一个普通 HTML、没有打包工具时，需要自行把依赖打成一个文件再引用。

## CDN

不安装 npm、临时看一下效果时，可以从 [esm.run](https://esm.run/)<!-- {.external} --> 加载。包发布到 npm 之后这条才会生效。

```html
<head>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <script type="importmap">
    {
      "imports": {
        "genv4/": "https://esm.run/genv4/"
      }
    }
  </script>
  <script type="module">
    import 'genv4/all.js';
    import {styles as typescaleStyles} from 'genv4/typography/md-typescale-styles.js';

    document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
  </script>
</head>
<body>
  <h1 class="md-typescale-display-medium">你好</h1>
  <form>
    <p class="md-typescale-body-medium">表单里的几个控件</p>
    <md-checkbox></md-checkbox>
    <div>
      <md-radio name="group"></md-radio>
      <md-radio name="group"></md-radio>
      <md-radio name="group"></md-radio>
    </div>
    <md-outlined-text-field label="喜欢的颜色" value="紫色"></md-outlined-text-field>
    <md-outlined-button type="reset">重置</md-outlined-button>
  </form>
  <style>
    form {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  </style>
</body>
```

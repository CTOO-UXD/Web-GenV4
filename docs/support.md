<!-- catalog-only-start --><!-- ---
name: 问题与支持
title: 问题与支持
order: 3
-----><!-- catalog-only-end -->

# 问题与支持

## 浏览器

当前支持：


| 浏览器     | 版本     |
| ------- | ------ |
| Chrome  | 120 +  |
| Edge    | 120 +  |
| Firefox | 119 +  |
| Safari* | 16.4 + |


 更早的 Safari 可以配合 `ElementInternals` [polyfill](https://www.npmjs.com/package/element-internals-polyfill) 使用。

## 常见问题

### 怎么改按钮的颜色？

很多组件的同一种颜色会拆成悬停、聚焦、按下等多条变量。

改组件用到的 `--md-sys-color-*` 即可，不用把每个状态都设一遍。

```css
/* 实心按钮使用 primary */
md-filled-button.spooky {
  --md-sys-color-primary: black;
  --md-sys-color-on-primary: yellow;
}

md-filled-button.error {
  --md-sys-color-primary: var(--md-sys-color-error);
  --md-sys-color-on-primary: var(--md-sys-color-on-error);
}
```



### 为什么悬停、聚焦、按下时颜色又变了？

这些状态各有自己的变量。不要逐个去改，改组件映射到的那条 `--md-sys-color-*`，和上一题一样。

### 为什么 `prefers-color-scheme: dark` 没有生效？

深色模式由应用自己决定何时启用。可以用任意选择器，配上深色的 `--md-sys-color-*`。

例如用 Sass：

```scss
@use 'genv4/color/color';

:root {
  @media (prefers-color-scheme: dark) {
    @include color.dark-theme;
  }
}
```

不会默认打开深色模式。不是每个应用都需要，自动带上深色令牌也会让样式体积变大。

### 怎么在自己的样式里使用 `--md-sys-*`？

要在自己的样式里用这些颜色，在全站样式里引入一次即可，不用每个元素各引一遍。`color.light-theme` 会在 `:root` 上生成一整套 `--md-sys-color-*`。

```scss
@use 'genv4/color/color';

:root {
  @include color.light-theme;
}
```

之后就可以写：

```css
h1 {
  color: var(--md-sys-color-primary);
}
```

深色那一套用 `color.dark-theme`，见上一题「为什么 `prefers-color-scheme: dark` 没有生效？」。

<!--
暂时不用。以后如果采用这两种方式，再去掉这段注释。

- 用 [Material Theme Builder](https://www.figma.com/community/plugin/1034969338659738588/Material-Theme-Builder) 这个 Figma 插件生成一套颜色。

- 用 [`material-color-utilities`](https://www.npmjs.com/package/@material/material-color-utilities) 在运行时生成颜色。
-->

### 怎么改套在别的组件里面的 `<md-*>`？

用 [CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS/::part) `::part()`。part 名是内部组件的标签名，去掉 `md-` 前缀。

```css
md-checkbox::part(focus-ring) {
  width: 32px;
  height: 32px;
}
```


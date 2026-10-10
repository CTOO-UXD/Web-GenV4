---
name: Icon
label: 图标 Icon
---

# 图标

图标用连字显示。标签里的文字要和 `genv4-icon` 里的图标名一致。

## 引入

先安装 `genv4-icon`，再引入字体和组件。字体族是 `GenV4 Icons`，也是 `--md-icon-font` 的默认值。

```js
import 'genv4-icon/genv4-icon.css';
import 'genv4/icon/icon.js';
```

## 示例

### 描边和填充

描边用图标名。填充在名字后面加 `-fill`。

<div class="figure-wrapper">
  <figure style="gap:16px;">
    <md-icon>check</md-icon>
    <md-icon>check-fill</md-icon>
  </figure>
</div>

```html
<md-icon>check</md-icon>
<md-icon>check-fill</md-icon>
```

### 同名的 AI 图标

Standard 和 AI 都有这个名字时，AI 加 `-ai`。填充再加 `-fill`。

<div class="figure-wrapper">
  <figure style="gap:16px;">
    <md-icon>search</md-icon>
    <md-icon>search-ai</md-icon>
    <md-icon>search-ai-fill</md-icon>
  </figure>
</div>

```html
<md-icon>search</md-icon>
<md-icon>search-ai</md-icon>
<md-icon>search-ai-fill</md-icon>
```

<!-- auto-generated theme docs start -->

## 主题

用组件 CSS 变量覆盖。下面只列出 Sass 里标记为支持的变量。

### 图标 `<md-icon>`

| 变量 | 默认值 |
| --- | --- |
| `--md-icon-font` | `'GenV4 Icons'` |
| `--md-icon-size` | `24px` |

<!-- auto-generated theme docs end -->

## 全部图标

点格子复制 `<md-icon>…</md-icon>`。默认只显示描边。

<icon-gallery></icon-gallery>

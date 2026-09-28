<!-- catalog-only-start --><!-- ---
name: 主题
title: 主题
order: 2
-----><!-- catalog-only-end -->

# 主题

## 全局与局部 token

变量有两层。系统变量全站共用，例如 `--md-sys-color-primary`、`--md-sys-typescale-*`、`--md-sys-shape-*`。组件变量只作用于一种组件，例如 `--md-filled-button-container-color`。

实心按钮的容器色先看 `--md-filled-button-container-color`。这条没设时，才用 `--md-sys-color-primary`。

只改主色，所有还没单独设过容器色的按钮一起变：

```css
:root {
  --md-sys-color-primary: #006a6a;
}
```

只要这一个按钮变，就设组件变量。这时再改主色，这个按钮不变：

```css
md-filled-button.danger {
  --md-filled-button-container-color: #b3261e;
}
```

字体、圆角也是这个顺序。某个组件具体有哪些变量，看该组件页的主题表。

## 颜色 token

下面是浅色主题的默认值。写在这些颜色上的文字，用对应的 `--md-sys-color-on-*`。表面用 `--md-sys-color-on-surface` 或 `--md-sys-color-on-surface-variant`。

| 变量 | 默认值 |
| --- | --- |
| `--md-sys-color-primary` | `#6750a4` |
| `--md-sys-color-primary-container` | `#eaddff` |
| `--md-sys-color-secondary` | `#625b71` |
| `--md-sys-color-secondary-container` | `#e8def8` |
| `--md-sys-color-tertiary` | `#7d5260` |
| `--md-sys-color-tertiary-container` | `#ffd8e4` |
| `--md-sys-color-error` | `#b3261e` |
| `--md-sys-color-error-container` | `#f9dedc` |
| `--md-sys-color-background` | `#fef7ff` |
| `--md-sys-color-surface` | `#fef7ff` |
| `--md-sys-color-surface-bright` | `#fef7ff` |
| `--md-sys-color-surface-dim` | `#ded8e1` |
| `--md-sys-color-surface-container` | `#f3edf7` |
| `--md-sys-color-surface-container-lowest` | `#ffffff` |
| `--md-sys-color-surface-container-low` | `#f7f2fa` |
| `--md-sys-color-surface-container-high` | `#ece6f0` |
| `--md-sys-color-surface-container-highest` | `#e6e0e9` |
| `--md-sys-color-outline` | `#79747e` |
| `--md-sys-color-outline-variant` | `#cac4d0` |

在全站设一次主色和它上面的文字色，自己的元素直接用：

```css
:root {
  --md-sys-color-primary: #006a6a;
  --md-sys-color-on-primary: #ffffff;
}

.banner {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
```

这些变量要先在 `:root` 上生成出来，做法见「问题与支持」里的「怎么在自己的样式里使用 `--md-sys-*`？」。

全部变量：`tokens/_md-sys-color.scss`

## 文字 token

全站换字体，改下面两条。默认都是 Roboto。

| 变量 | 默认值 |
| --- | --- |
| `--md-ref-typeface-brand` | `Roboto` |
| `--md-ref-typeface-plain` | `Roboto` |

下面是五档文字的 medium。Display、Headline 用品牌字体，Title、Body、Label 用普通字体。

| 变量 | 默认值 |
| --- | --- |
| `--md-sys-typescale-display-medium-font` | `Roboto` |
| `--md-sys-typescale-display-medium-size` | `2.8125rem` |
| `--md-sys-typescale-display-medium-line-height` | `3.25rem` |
| `--md-sys-typescale-display-medium-weight` | `400` |
| `--md-sys-typescale-headline-medium-font` | `Roboto` |
| `--md-sys-typescale-headline-medium-size` | `1.75rem` |
| `--md-sys-typescale-headline-medium-line-height` | `2.25rem` |
| `--md-sys-typescale-headline-medium-weight` | `400` |
| `--md-sys-typescale-title-medium-font` | `Roboto` |
| `--md-sys-typescale-title-medium-size` | `1rem` |
| `--md-sys-typescale-title-medium-line-height` | `1.5rem` |
| `--md-sys-typescale-title-medium-weight` | `500` |
| `--md-sys-typescale-body-medium-font` | `Roboto` |
| `--md-sys-typescale-body-medium-size` | `0.875rem` |
| `--md-sys-typescale-body-medium-line-height` | `1.25rem` |
| `--md-sys-typescale-body-medium-weight` | `400` |
| `--md-sys-typescale-label-medium-font` | `Roboto` |
| `--md-sys-typescale-label-medium-size` | `0.75rem` |
| `--md-sys-typescale-label-medium-line-height` | `1rem` |
| `--md-sys-typescale-label-medium-weight` | `500` |

全站换成另一种无衬线字体：

```css
:root {
  --md-ref-typeface-brand: "Noto Sans";
  --md-ref-typeface-plain: "Noto Sans";
}
```

只把正文 medium 加大，其它档不动：

```css
:root {
  --md-sys-typescale-body-medium-size: 1rem;
  --md-sys-typescale-body-medium-line-height: 1.5rem;
}

p {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  font-weight: var(--md-sys-typescale-body-medium-weight);
}
```

只换标题用的字体时，改 `--md-sys-typescale-headline-medium-font`，不要改上面那两个全局字体名。

全部变量：`tokens/_md-ref-typeface.scss`、`tokens/_md-sys-typescale.scss`

## 圆角 token

| 变量 | 默认值 |
| --- | --- |
| `--md-sys-shape-corner-none` | `0px` |
| `--md-sys-shape-corner-extra-small` | `4px` |
| `--md-sys-shape-corner-small` | `8px` |
| `--md-sys-shape-corner-medium` | `12px` |
| `--md-sys-shape-corner-large` | `16px` |
| `--md-sys-shape-corner-extra-large` | `28px` |
| `--md-sys-shape-corner-full` | `9999px` |

自己的卡片用中等圆角：

```css
.card {
  border-radius: var(--md-sys-shape-corner-medium);
}
```

按钮默认用的是 `--md-sys-shape-corner-full`，改 `corner-medium` 不会让按钮变方。要改按钮圆角，设 `--md-filled-button-container-shape`。具体见对应组件的主题。

全部变量：`tokens/_md-sys-shape.scss`

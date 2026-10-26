---
name: Alert banner
label: 提示横幅 Alert banner
---

# 提示横幅

在内容上方放一条提示。显示什么、关掉以后还显示不显示，由页面决定。组件只负责画出来，并发出关闭。

## 引入

要放按钮时，再引入对应的按钮。

| 标签 | 何时使用 |
| --- | --- |
| `<md-alert-banner>` | 页面内容上方的一条通知、说明、成功、警告或错误 |
| `<md-filled-button>` | 横幅里的主操作 |
| `<md-outlined-button>` | 横幅里的次操作 |
| `<md-checkbox>` | 横幅里的勾选 |

```js
import 'genv4/alert-banner/alert-banner.js';
import 'genv4/button/filled-button.js';
import 'genv4/button/outlined-button.js';
import 'genv4/checkbox/checkbox.js';
```

## 示例

默认宽 740px，用 `--md-alert-banner-width` 覆盖。父级更窄时横幅不缩小，由页面滚动。关闭按钮一直在。点关闭会发出 `close`，并加上 `hidden`，不再占高度。组件不记住这次关闭。页面去掉 `hidden` 就会再显示；页面如果记下关闭，下次可以不渲染。

<style>
  .figure-wrapper figure {
    align-items: center;
    flex-direction: column;
    gap: 16px;
    padding-block: 24px;
  }
</style>

### 五种类型

<div class="figure-wrapper">
  <figure>
    <md-alert-banner label="普通通知" supporting-text="默认底色和图标。"></md-alert-banner>
    <md-alert-banner scheme="informational" label="说明" supporting-text="补充一点信息。"></md-alert-banner>
    <md-alert-banner scheme="success" label="已完成" supporting-text="这一步已经做完。"></md-alert-banner>
    <md-alert-banner scheme="warning" label="请注意" supporting-text="继续之前先看一下。"></md-alert-banner>
    <md-alert-banner scheme="error" label="无法保存" supporting-text="这次没有写入。"></md-alert-banner>
  </figure>
</div>

```html
<md-alert-banner label="普通通知" supporting-text="默认底色和图标。"></md-alert-banner>
<md-alert-banner scheme="informational" label="说明" supporting-text="补充一点信息。"></md-alert-banner>
<md-alert-banner scheme="success" label="已完成" supporting-text="这一步已经做完。"></md-alert-banner>
<md-alert-banner scheme="warning" label="请注意" supporting-text="继续之前先看一下。"></md-alert-banner>
<md-alert-banner scheme="error" label="无法保存" supporting-text="这次没有写入。"></md-alert-banner>
```

### 阴影

<div class="figure-wrapper">
  <figure>
    <md-alert-banner label="普通通知" supporting-text="平铺在页面上。"></md-alert-banner>
    <md-alert-banner elevated label="普通通知" supporting-text="加上阴影，和背景分开。"></md-alert-banner>
  </figure>
</div>

```html
<md-alert-banner label="普通通知" supporting-text="平铺在页面上。"></md-alert-banner>
<md-alert-banner elevated label="普通通知" supporting-text="加上阴影，和背景分开。"></md-alert-banner>
```

### 按钮

<div class="figure-wrapper">
  <figure>
    <md-alert-banner label="普通通知" supporting-text="实心按钮用主色。">
      <md-filled-button slot="actions">确定</md-filled-button>
      <md-outlined-button slot="actions">取消</md-outlined-button>
    </md-alert-banner>
    <md-alert-banner scheme="informational" label="说明" supporting-text="实心按钮改成深色。">
      <md-filled-button slot="actions">确定</md-filled-button>
      <md-outlined-button slot="actions">取消</md-outlined-button>
    </md-alert-banner>
    <md-alert-banner scheme="success" label="已完成" supporting-text="实心按钮改成深色。">
      <md-filled-button slot="actions">确定</md-filled-button>
      <md-outlined-button slot="actions">取消</md-outlined-button>
    </md-alert-banner>
    <md-alert-banner scheme="warning" label="请注意" supporting-text="实心按钮改成深色。">
      <md-filled-button slot="actions">确定</md-filled-button>
      <md-outlined-button slot="actions">取消</md-outlined-button>
    </md-alert-banner>
    <md-alert-banner scheme="error" label="无法保存" supporting-text="实心按钮改成深色。">
      <md-filled-button slot="actions">确定</md-filled-button>
      <md-outlined-button slot="actions">取消</md-outlined-button>
    </md-alert-banner>
  </figure>
</div>

```html
<md-alert-banner label="普通通知" supporting-text="实心按钮用主色。">
  <md-filled-button slot="actions">确定</md-filled-button>
  <md-outlined-button slot="actions">取消</md-outlined-button>
</md-alert-banner>
<md-alert-banner scheme="informational" label="说明" supporting-text="实心按钮改成深色。">
  <md-filled-button slot="actions">确定</md-filled-button>
  <md-outlined-button slot="actions">取消</md-outlined-button>
</md-alert-banner>
<md-alert-banner scheme="success" label="已完成" supporting-text="实心按钮改成深色。">
  <md-filled-button slot="actions">确定</md-filled-button>
  <md-outlined-button slot="actions">取消</md-outlined-button>
</md-alert-banner>
<md-alert-banner scheme="warning" label="请注意" supporting-text="实心按钮改成深色。">
  <md-filled-button slot="actions">确定</md-filled-button>
  <md-outlined-button slot="actions">取消</md-outlined-button>
</md-alert-banner>
<md-alert-banner scheme="error" label="无法保存" supporting-text="实心按钮改成深色。">
  <md-filled-button slot="actions">确定</md-filled-button>
  <md-outlined-button slot="actions">取消</md-outlined-button>
</md-alert-banner>
```

### 勾选

勾选放在 `checkbox` 插槽。勾上没有由组件记住。

<div class="figure-wrapper">
  <figure>
    <md-alert-banner label="带勾选框" supporting-text="勾选状态由页面自己记。">
      <label slot="checkbox"><md-checkbox touch-target="wrapper"></md-checkbox>下次不再显示</label>
    </md-alert-banner>
  </figure>
</div>

```html
<md-alert-banner label="带勾选框" supporting-text="勾选状态由页面自己记。">
  <label slot="checkbox"><md-checkbox touch-target="wrapper"></md-checkbox>下次不再显示</label>
</md-alert-banner>
```

{#
演练场入口。发布后去掉这对注释再看效果。
{% playgroundexample dirname=dirname %}
#}

<!-- auto-generated API docs start -->

## API

下表适用于 `<md-alert-banner>`。


### 属性

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| 属性 | HTML 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `scheme` | `scheme` | `"warning" \| "error" \| "default" \| "informational" \| "success"` | `'default'` | 配色。取值 default、informational、success、warning、error。 |
| `elevated` | `elevated` | `boolean` | `false` | 为真时加阴影。默认没有。 |
| `label` | `label` | `string` | `''` | 标题。空字符串不画这一行。 |
| `supportingText` | `supporting-text` | `string` | `''` | 正文。空字符串不画这一行。 |
| `icon` | `icon` | `string` | `''` | 图标连字。空字符串时按 scheme 用默认图标。 |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

### 事件

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| 事件 | 类型 | 冒泡 | 穿透 | 说明 |
| --- | --- | --- | --- | --- |
| `close` | `Event` | 是 | 是 | 点关闭时发出。组件随即加上 hidden，不再占高度。组件不记住这次关闭，要不要再出现由页面决定。 |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->

### 插槽

| 名称 | 说明 |
| --- | --- |
| `actions` | 按钮。放 `md-filled-button` 或 `md-outlined-button`。横幅里按钮高 32。为空时不占位 |
| `checkbox` | 勾选框和它的文字。组件只负责显示，不记勾选状态。为空时不占位 |

<!-- auto-generated theme docs start -->

## 主题

用组件 CSS 变量覆盖。下面只列出 Sass 里标记为支持的变量。

### 提示横幅 `<md-alert-banner>`

| 变量 | 默认值 |
| --- | --- |
| `--md-alert-banner-button-color` | `#0e131e` |
| `--md-alert-banner-button-gap` | `6px` |
| `--md-alert-banner-button-height` | `32px` |
| `--md-alert-banner-button-label-color` | `--md-sys-color-on-primary` |
| `--md-alert-banner-button-label-line-height` | `16px` |
| `--md-alert-banner-button-label-size` | `12px` |
| `--md-alert-banner-button-label-weight` | `600` |
| `--md-alert-banner-button-padding` | `16px` |
| `--md-alert-banner-button-padding-block` | `8px` |
| `--md-alert-banner-checkbox-label-line-height` | `16px` |
| `--md-alert-banner-checkbox-label-size` | `12px` |
| `--md-alert-banner-checkbox-label-tracking` | `0.1px` |
| `--md-alert-banner-close-icon-color` | `#0e131e` |
| `--md-alert-banner-close-icon-size` | `16px` |
| `--md-alert-banner-close-size` | `32px` |
| `--md-alert-banner-column-gap` | `12px` |
| `--md-alert-banner-content-gap` | `16px` |
| `--md-alert-banner-copy-min-size` | `268px` |
| `--md-alert-banner-elevation` | `0 1px 3px 0 rgba(0, 0, 0, .3), 0 4px 8px 3px rgba(0, 0, 0, .12)` |
| `--md-alert-banner-icon-container-height` | `32px` |
| `--md-alert-banner-icon-container-shape` | `999px` |
| `--md-alert-banner-icon-container-width` | `32px` |
| `--md-alert-banner-icon-size` | `16px` |
| `--md-alert-banner-label-line-height` | `20px` |
| `--md-alert-banner-label-size` | `14px` |
| `--md-alert-banner-label-tracking` | `0.25px` |
| `--md-alert-banner-label-weight` | `600` |
| `--md-alert-banner-min-height` | `72px` |
| `--md-alert-banner-padding` | `12px` |
| `--md-alert-banner-shape` | `16px` |
| `--md-alert-banner-success-container-color` | `#a8f5a6` |
| `--md-alert-banner-success-icon-color` | `#3e8643` |
| `--md-alert-banner-supporting-weight` | `400` |
| `--md-alert-banner-warning-container-color` | `#ffdeaa` |
| `--md-alert-banner-warning-icon-color` | `#9c6e03` |
| `--md-alert-banner-width` | `740px` |

全部样式：[alert-banner/internal/_alert-banner.scss](https://github.com/CTOO-UXD/Web-GenV4/blob/main/alert-banner/internal/_alert-banner.scss)

<!-- auto-generated theme docs end -->

---
name: Process stepper
label: 步骤条 Process stepper
---

# 步骤条

画出一条流程。每一步是完成、进行中、未开始还是禁用，由页面写在步骤上。标签宜短，常见 3 到 10 步，组件不拦。

## 引入

引入这一份就会带上步骤。

| 标签 | 何时使用 |
| --- | --- |
| `<md-process-stepper>` | 整条流程。决定方向、圆点类型和标签 |
| `<md-process-step>` | 其中一步。标签写在里面，状态写在 `state` |

```js
import 'genv4/process-stepper/process-stepper.js';
```

## 示例

横排给组件设宽度，竖排设高度，线把多出来的空间分掉。不设时线停在最短。下面横排写满这一栏，竖排高度 360px。完成后面是粗主色线，禁用后面是灰细线，进行中和未开始后面是细主色线。最后一步没有线。

<style>
  .figure-wrapper figure {
    box-sizing: border-box;
    justify-content: center;
    max-width: 100%;
    min-width: 0;
    padding-block: 32px;
    width: 100%;
  }
</style>

### 横排图标

<div class="figure-wrapper">
  <figure>
    <md-process-stepper type="icon" style="width: 100%">
      <md-process-step icon="mail" state="complete">完成</md-process-step>
      <md-process-step icon="edit" state="in-progress">进行中</md-process-step>
      <md-process-step icon="search">未开始</md-process-step>
      <md-process-step icon="block" state="disabled">禁用</md-process-step>
      <md-process-step icon="flag">未开始</md-process-step>
    </md-process-stepper>
  </figure>
</div>

```html
<md-process-stepper type="icon" style="width: 100%">
  <md-process-step icon="mail" state="complete">完成</md-process-step>
  <md-process-step icon="edit" state="in-progress">进行中</md-process-step>
  <md-process-step icon="search">未开始</md-process-step>
  <md-process-step icon="block" state="disabled">禁用</md-process-step>
  <md-process-step icon="flag">未开始</md-process-step>
</md-process-stepper>
```

### 横排序号

<div class="figure-wrapper">
  <figure>
    <md-process-stepper style="width: 100%">
      <md-process-step state="complete">完成</md-process-step>
      <md-process-step state="in-progress">进行中</md-process-step>
      <md-process-step>未开始</md-process-step>
      <md-process-step state="disabled">禁用</md-process-step>
      <md-process-step>未开始</md-process-step>
    </md-process-stepper>
  </figure>
</div>

```html
<md-process-stepper style="width: 100%">
  <md-process-step state="complete">完成</md-process-step>
  <md-process-step state="in-progress">进行中</md-process-step>
  <md-process-step>未开始</md-process-step>
  <md-process-step state="disabled">禁用</md-process-step>
  <md-process-step>未开始</md-process-step>
</md-process-stepper>
```

### 横排空圈

<div class="figure-wrapper">
  <figure>
    <md-process-stepper type="empty" style="width: 100%">
      <md-process-step state="complete">完成</md-process-step>
      <md-process-step state="in-progress">进行中</md-process-step>
      <md-process-step>未开始</md-process-step>
      <md-process-step state="disabled">禁用</md-process-step>
      <md-process-step>未开始</md-process-step>
    </md-process-stepper>
  </figure>
</div>

```html
<md-process-stepper type="empty" style="width: 100%">
  <md-process-step state="complete">完成</md-process-step>
  <md-process-step state="in-progress">进行中</md-process-step>
  <md-process-step>未开始</md-process-step>
  <md-process-step state="disabled">禁用</md-process-step>
  <md-process-step>未开始</md-process-step>
</md-process-stepper>
```

### 竖排图标

<div class="figure-wrapper">
  <figure>
    <md-process-stepper type="icon" orientation="vertical" style="height: 360px">
      <md-process-step icon="mail" state="complete">完成</md-process-step>
      <md-process-step icon="edit" state="in-progress">进行中</md-process-step>
      <md-process-step icon="search">未开始</md-process-step>
      <md-process-step icon="block" state="disabled">禁用</md-process-step>
      <md-process-step icon="flag">未开始</md-process-step>
    </md-process-stepper>
  </figure>
</div>

```html
<md-process-stepper type="icon" orientation="vertical" style="height: 360px">
  <md-process-step icon="mail" state="complete">完成</md-process-step>
  <md-process-step icon="edit" state="in-progress">进行中</md-process-step>
  <md-process-step icon="search">未开始</md-process-step>
  <md-process-step icon="block" state="disabled">禁用</md-process-step>
  <md-process-step icon="flag">未开始</md-process-step>
</md-process-stepper>
```

### 竖排序号

<div class="figure-wrapper">
  <figure>
    <md-process-stepper orientation="vertical" style="height: 360px">
      <md-process-step state="complete">完成</md-process-step>
      <md-process-step state="in-progress">进行中</md-process-step>
      <md-process-step>未开始</md-process-step>
      <md-process-step state="disabled">禁用</md-process-step>
      <md-process-step>未开始</md-process-step>
    </md-process-stepper>
  </figure>
</div>

```html
<md-process-stepper orientation="vertical" style="height: 360px">
  <md-process-step state="complete">完成</md-process-step>
  <md-process-step state="in-progress">进行中</md-process-step>
  <md-process-step>未开始</md-process-step>
  <md-process-step state="disabled">禁用</md-process-step>
  <md-process-step>未开始</md-process-step>
</md-process-stepper>
```

### 竖排空圈

<div class="figure-wrapper">
  <figure>
    <md-process-stepper type="empty" orientation="vertical" style="height: 360px">
      <md-process-step state="complete">完成</md-process-step>
      <md-process-step state="in-progress">进行中</md-process-step>
      <md-process-step>未开始</md-process-step>
      <md-process-step state="disabled">禁用</md-process-step>
      <md-process-step>未开始</md-process-step>
    </md-process-stepper>
  </figure>
</div>

```html
<md-process-stepper type="empty" orientation="vertical" style="height: 360px">
  <md-process-step state="complete">完成</md-process-step>
  <md-process-step state="in-progress">进行中</md-process-step>
  <md-process-step>未开始</md-process-step>
  <md-process-step state="disabled">禁用</md-process-step>
  <md-process-step>未开始</md-process-step>
</md-process-stepper>
```

{#
演练场入口。发布后去掉这对注释再看效果。
{% playgroundexample dirname=dirname %}
#}

<!-- auto-generated API docs start -->

## API

步骤条和步骤的属性不同，下面分表列出。


### 步骤条 <code>&lt;md-process-stepper&gt;</code>
#### 属性

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| 属性 | HTML 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `orientation` | `orientation` | `"horizontal" \| "vertical"` | `'horizontal'` | 方向。取值 horizontal、vertical。 |
| `type` | `type` | `"number" \| "icon" \| "empty"` | `'number'` | 圆点里画什么。取值 number、icon、empty。一条流程只用一种。 |
| `showLabels` | `show-labels` | `boolean` | `true` | 是否显示每一步的标签。默认开。要关掉，在脚本里把 showLabels 设为 false。 |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

### 步骤 <code>&lt;md-process-step&gt;</code>
#### 属性

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| 属性 | HTML 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `state` | `state` | `"disabled" \| "complete" \| "in-progress" \| "enabled"` | `'enabled'` | 这一步的状态。取值 complete、in-progress、enabled、disabled。默认 enabled。完成后面是 3px 主色线，禁用后面是灰细线，进行中和未开始后面是细主色线。最后一步没有线。 |
| `icon` | `icon` | `string` | `''` | 图标连字。只在父级 type 为 icon、且这一步不是完成时使用。不写就画空圈。 |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->

### 插槽

| 名称 | 说明 |
| --- | --- |
| 默认 | 步骤的标签文字。写在 `<md-process-step>` 里面 |

<!-- auto-generated theme docs start -->

## 主题

用组件 CSS 变量覆盖。下面只列出 Sass 里标记为支持的变量。

### 步骤条 `<md-process-stepper>`

| 变量 | 默认值 |
| --- | --- |
| `--md-process-stepper-border-size` | `2px` |
| `--md-process-stepper-circle-size` | `24px` |
| `--md-process-stepper-label-gap` | `8px` |
| `--md-process-stepper-label-line-height` | `22px` |
| `--md-process-stepper-label-size` | `16px` |
| `--md-process-stepper-label-weight` | `600` |
| `--md-process-stepper-marker-gap` | `8px` |
| `--md-process-stepper-marker-size` | `16px` |
| `--md-process-stepper-number-line-height` | `16px` |
| `--md-process-stepper-number-size` | `12px` |
| `--md-process-stepper-number-weight` | `600` |
| `--md-process-stepper-step-min-size` | `88px` |
| `--md-process-stepper-trail-completed-size` | `3px` |
| `--md-process-stepper-trail-min-size` | `32px` |
| `--md-process-stepper-trail-padding` | `4px` |
| `--md-process-stepper-trail-size` | `2px` |

全部样式：[process-stepper/internal/_process-stepper.scss](https://github.com/CTOO-UXD/Web-GenV4/blob/main/process-stepper/internal/_process-stepper.scss)

<!-- auto-generated theme docs end -->

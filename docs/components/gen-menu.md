---
name: Menu
label: 菜单 Menu
dirname: gen-menu
---

# 菜单

点锚点打开菜单。点一条之后，选中换到那一条，菜单关闭；再打开时选中还在那一条。箭头只是装饰，点了也是关闭。这轮没有子菜单。

## 引入

组只在两组及以上时才需要。勾用 `md-icon`。

| 标签 | 何时使用 |
| --- | --- |
| `<md-gen-menu>` | 菜单。负责锚点、打开关闭和配色 |
| `<md-gen-menu-group>` | 一张卡。两组及以上时包住条目 |
| `<md-gen-menu-item>` | 一行条目 |

```js
import 'genv4/gen-menu/gen-menu.js';
import 'genv4/gen-menu/gen-menu-group.js';
import 'genv4/gen-menu/gen-menu-item.js';
import 'genv4/icon/icon.js';
```

## 示例

锚点和菜单放在同一个 `position: relative` 的容器里。输入框、按钮、图标按钮只当锚点。点锚点切换 `open` 就能打开和关闭，点条目后菜单自己关。选中由页面设置：在菜单的 `click` 里给点中的那条加 `selected`，其余去掉。

下面代码里的 `<svg data-icon="…">` 是占位，换成自己的图标即可。本页用一段脚本按名字填入路径：

```js
const ICONS = {
  star: {viewBox: '0 0 24 24', d: STAR_OUTLINE}, // 空心星，一条 path
  'star-filled': {viewBox: '0 0 24 24', d: STAR_DISK + STAR_INNER}, // 外圆加内圆，evenodd
  arrow: {viewBox: '0 0 20 20', d: ARROW},
};

for (const svg of document.querySelectorAll('svg[data-icon]')) {
  const {viewBox, d} = ICONS[svg.dataset.icon];
  svg.setAttribute('viewBox', viewBox);
  svg.innerHTML = `<path d="${d}"></path>`;
}
```

<style>
  main > .figure-wrapper {
    /* 菜单打开后会超出锚点，不能被 main 子元素的 overflow-x: auto 裁掉 */
    overflow: visible;
  }

  .gen-menu-figure {
    padding-block: 24px;
  }

  .gen-menu-demo {
    position: relative;
    width: fit-content;
    max-width: 100%;
  }

  .gen-menu-demo md-text-input {
    width: 208px;
  }
</style>

### 限制高度

一组，圆角 16。第 3 条选中，头部的勾只在选中时出现，未选中不占位。`max-height: 196px` 露出 4 行，下面的条目在菜单里滚。

<div class="figure-wrapper">
  <figure class="gen-menu-figure">
    <div class="gen-menu-demo">
      <md-text-input id="height-anchor" label="菜单" readonly value="三条"></md-text-input>
      <md-gen-menu id="height-menu" anchor="height-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4" style="max-height: 196px">
        <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>一条</md-gen-menu-item>
        <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>两条</md-gen-menu-item>
        <md-gen-menu-item selected><md-icon slot="start" selected aria-hidden="true">check</md-icon>三条</md-gen-menu-item>
        <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>四条</md-gen-menu-item>
        <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>五条</md-gen-menu-item>
        <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>六条</md-gen-menu-item>
        <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>七条</md-gen-menu-item>
      </md-gen-menu>
    </div>
  </figure>
</div>

```html
<div style="position: relative">
  <md-text-input id="height-anchor" label="菜单" readonly value="三条"></md-text-input>
  <md-gen-menu id="height-menu" anchor="height-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4" style="max-height: 196px">
    <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>一条</md-gen-menu-item>
    <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>两条</md-gen-menu-item>
    <md-gen-menu-item selected><md-icon slot="start" selected aria-hidden="true">check</md-icon>三条</md-gen-menu-item>
    <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>四条</md-gen-menu-item>
    <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>五条</md-gen-menu-item>
    <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>六条</md-gen-menu-item>
    <md-gen-menu-item><md-icon slot="start" selected aria-hidden="true">check</md-icon>七条</md-gen-menu-item>
  </md-gen-menu>
</div>

<script type="module">
  const anchor = document.querySelector('#height-anchor');
  const menu = document.querySelector('#height-menu');
  anchor.addEventListener('click', () => { menu.open = !menu.open; });
</script>
```

### 选中换图标

一组。未选中是空心星，选中换成实心星，文字位置不动。输入框不放放大镜。

<div class="figure-wrapper">
  <figure class="gen-menu-figure">
    <div class="gen-menu-demo">
      <md-text-input id="swap-anchor" label="菜单" readonly value="两条"></md-text-input>
      <md-gen-menu id="swap-menu" anchor="swap-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4">
        <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="start" selected data-icon="star-filled"></svg>一条</md-gen-menu-item>
        <md-gen-menu-item selected><svg slot="start" data-icon="star"></svg><svg slot="start" selected data-icon="star-filled"></svg>两条</md-gen-menu-item>
        <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="start" selected data-icon="star-filled"></svg>三条</md-gen-menu-item>
        <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="start" selected data-icon="star-filled"></svg>四条</md-gen-menu-item>
      </md-gen-menu>
    </div>
  </figure>
</div>

```html
<div style="position: relative">
  <md-text-input id="swap-anchor" label="菜单" readonly value="两条"></md-text-input>
  <md-gen-menu id="swap-menu" anchor="swap-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4">
    <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="start" selected data-icon="star-filled"></svg>一条</md-gen-menu-item>
    <md-gen-menu-item selected><svg slot="start" data-icon="star"></svg><svg slot="start" selected data-icon="star-filled"></svg>两条</md-gen-menu-item>
    <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="start" selected data-icon="star-filled"></svg>三条</md-gen-menu-item>
    <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="start" selected data-icon="star-filled"></svg>四条</md-gen-menu-item>
  </md-gen-menu>
</div>

<script type="module">
  const anchor = document.querySelector('#swap-anchor');
  const menu = document.querySelector('#swap-menu');
  anchor.addEventListener('click', () => { menu.open = !menu.open; });
</script>
```

### 头尾图标

一组。没有预先选中的行。头部是空心星，尾部是三角箭头。按钮用现有的浅色实心按钮。

<div class="figure-wrapper">
  <figure class="gen-menu-figure">
    <div class="gen-menu-demo">
      <md-filled-tonal-button id="icons-anchor"><svg slot="icon" data-icon="star"></svg>标签</md-filled-tonal-button>
      <md-gen-menu id="icons-menu" anchor="icons-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4">
        <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="end" data-icon="arrow"></svg>一条</md-gen-menu-item>
        <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="end" data-icon="arrow"></svg>两条</md-gen-menu-item>
        <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="end" data-icon="arrow"></svg>三条</md-gen-menu-item>
        <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="end" data-icon="arrow"></svg>四条</md-gen-menu-item>
      </md-gen-menu>
    </div>
  </figure>
</div>

```html
<div style="position: relative">
  <md-filled-tonal-button id="icons-anchor"><svg slot="icon" data-icon="star"></svg>标签</md-filled-tonal-button>
  <md-gen-menu id="icons-menu" anchor="icons-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4">
    <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="end" data-icon="arrow"></svg>一条</md-gen-menu-item>
    <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="end" data-icon="arrow"></svg>两条</md-gen-menu-item>
    <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="end" data-icon="arrow"></svg>三条</md-gen-menu-item>
    <md-gen-menu-item><svg slot="start" data-icon="star"></svg><svg slot="end" data-icon="arrow"></svg>四条</md-gen-menu-item>
  </md-gen-menu>
</div>

<script type="module">
  const anchor = document.querySelector('#icons-anchor');
  const menu = document.querySelector('#icons-menu');
  anchor.addEventListener('click', () => { menu.open = !menu.open; });
</script>
```

### 分组和 Vibrant

两组，每张卡圆角 8，中间 2px 缝。尾部是箭头，选中那条换成勾。配色是 `theme="vibrant"`。锚点用现有的实心图标按钮。

<div class="figure-wrapper">
  <figure class="gen-menu-figure">
    <div class="gen-menu-demo">
      <md-filled-icon-button id="groups-anchor" aria-label="打开菜单"><svg data-icon="star"></svg></md-filled-icon-button>
      <md-gen-menu id="groups-menu" anchor="groups-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4" theme="vibrant">
        <md-gen-menu-group>
          <md-gen-menu-item><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>一条</md-gen-menu-item>
          <md-gen-menu-item selected><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>两条</md-gen-menu-item>
          <md-gen-menu-item><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>三条</md-gen-menu-item>
        </md-gen-menu-group>
        <md-gen-menu-group>
          <md-gen-menu-item><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>四条</md-gen-menu-item>
          <md-gen-menu-item><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>五条</md-gen-menu-item>
        </md-gen-menu-group>
      </md-gen-menu>
    </div>
  </figure>
</div>

```html
<div style="position: relative">
  <md-filled-icon-button id="groups-anchor" aria-label="打开菜单"><svg data-icon="star"></svg></md-filled-icon-button>
  <md-gen-menu id="groups-menu" anchor="groups-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4" theme="vibrant">
    <md-gen-menu-group>
      <md-gen-menu-item><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>一条</md-gen-menu-item>
      <md-gen-menu-item selected><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>两条</md-gen-menu-item>
      <md-gen-menu-item><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>三条</md-gen-menu-item>
    </md-gen-menu-group>
    <md-gen-menu-group>
      <md-gen-menu-item><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>四条</md-gen-menu-item>
      <md-gen-menu-item><svg slot="end" data-icon="arrow"></svg><md-icon slot="end" selected aria-hidden="true">check</md-icon>五条</md-gen-menu-item>
    </md-gen-menu-group>
  </md-gen-menu>
</div>

<script type="module">
  const anchor = document.querySelector('#groups-anchor');
  const menu = document.querySelector('#groups-menu');
  anchor.addEventListener('click', () => { menu.open = !menu.open; });
</script>
```

### 禁用

一组。一条只禁用，一条选中并且禁用。禁用的整条 38% 透明，点了不换选中，也不关菜单。选中底还在。

<div class="figure-wrapper">
  <figure class="gen-menu-figure">
    <div class="gen-menu-demo">
      <md-filled-tonal-button id="disabled-anchor"><svg slot="icon" data-icon="star"></svg>标签</md-filled-tonal-button>
      <md-gen-menu id="disabled-menu" anchor="disabled-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4">
        <md-gen-menu-item>一条</md-gen-menu-item>
        <md-gen-menu-item disabled>禁用</md-gen-menu-item>
        <md-gen-menu-item selected disabled>选中并且禁用</md-gen-menu-item>
        <md-gen-menu-item>四条</md-gen-menu-item>
      </md-gen-menu>
    </div>
  </figure>
</div>

```html
<div style="position: relative">
  <md-filled-tonal-button id="disabled-anchor"><svg slot="icon" data-icon="star"></svg>标签</md-filled-tonal-button>
  <md-gen-menu id="disabled-menu" anchor="disabled-anchor" quick anchor-corner="end-start" menu-corner="start-start" y-offset="4">
    <md-gen-menu-item>一条</md-gen-menu-item>
    <md-gen-menu-item disabled>禁用</md-gen-menu-item>
    <md-gen-menu-item selected disabled>选中并且禁用</md-gen-menu-item>
    <md-gen-menu-item>四条</md-gen-menu-item>
  </md-gen-menu>
</div>

<script type="module">
  const anchor = document.querySelector('#disabled-anchor');
  const menu = document.querySelector('#disabled-menu');
  anchor.addEventListener('click', () => { menu.open = !menu.open; });
</script>
```

<script type="module">
  const STAR_OUTLINE =
    'M8 18L12 14.95L16 18L14.5 13.05L18.5 10.2H13.6L12 5L10.4 10.2H5.5L9.5 13.05L8 18ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z';
  const STAR_INNER = STAR_OUTLINE.slice(STAR_OUTLINE.lastIndexOf('M12 20'));
  const STAR_DISK =
    'M8 18L12 14.95L16 18L14.5 13.05L18.5 10.2H13.6L12 5L10.4 10.2H5.5L9.5 13.05L8 18ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22Z';
  const ARROW = 'M8.333 14.167V5.833L12.5 10L8.333 14.167Z';
  const ICONS = {
    star: {viewBox: '0 0 24 24', d: STAR_OUTLINE},
    'star-filled': {viewBox: '0 0 24 24', d: STAR_DISK + STAR_INNER},
    arrow: {viewBox: '0 0 20 20', d: ARROW},
  };

  for (const svg of document.querySelectorAll('main svg[data-icon]')) {
    const {viewBox, d} = ICONS[svg.dataset.icon];
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('fill-rule', 'evenodd');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<path d="${d}"></path>`;
  }

  await customElements.whenDefined('md-gen-menu');

  function labelOf(item) {
    return Array.from(item.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .join('');
  }

  for (const menu of document.querySelectorAll('md-gen-menu')) {
    const anchor = document.getElementById(menu.anchor);
    if (!anchor) continue;
    anchor.addEventListener('click', () => {
      const next = !menu.open;
      for (const other of document.querySelectorAll('md-gen-menu')) {
        if (other !== menu && other.open) other.close();
      }
      menu.open = next;
    });
    menu.addEventListener('click', (event) => {
      const item = event.target.closest('md-gen-menu-item');
      if (!item || !menu.contains(item) || item.disabled) return;
      for (const row of menu.querySelectorAll('md-gen-menu-item')) {
        row.selected = row === item;
      }
      const label = labelOf(item);
      if (anchor.localName === 'md-text-input') anchor.value = label;
      const text = [...anchor.childNodes].find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
      );
      if (text) text.textContent = label;
    });
  }
</script>

<!-- auto-generated API docs start -->

## API

菜单、组和条目的属性不同，下面分表列出。


### 菜单 <code>&lt;md-gen-menu&gt;</code>
#### 属性

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| 属性 | HTML 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `anchor` | `anchor` | `string` | `''` | 锚点元素的 id。和锚点要在同一个根节点里。 |
| `positioning` | `positioning` | `"absolute" \| "fixed" \| "document" \| "popover"` | `'absolute'` | 相对谁定位。`absolute` 相对锚点的定位父级，`fixed` 相对窗口，`document` 相对文档，`popover` 用顶层，浏览器不支持时退回 `fixed`。 |
| `quick` | `quick` | `boolean` | `false` | 跳过打开和关闭动画。 |
| `hasOverflow` | `has-overflow` | `boolean` | `false` | 为真时不裁剪内容，也不出现滚动条。 |
| `open` | `open` | `boolean` | `false` | 菜单是否打开。 |
| `xOffset` | `x-offset` | `number` | `0` | 相对锚点的水平偏移，单位像素。从左到右时正数向右，从右到左时正数向左。 |
| `yOffset` | `y-offset` | `number` | `0` | 相对锚点的垂直偏移，单位像素。正数向下。 |
| `noHorizontalFlip` | `no-horizontal-flip` | `boolean` | `false` | 为真时，菜单在水平方向超出视口也不翻转。 |
| `noVerticalFlip` | `no-vertical-flip` | `boolean` | `false` | 为真时，菜单在垂直方向超出视口也不翻转。 |
| `typeaheadDelay` | `typeahead-delay` | `number` | `200` | 键盘按字跳转时，两次按键之间最多隔多久，单位毫秒。超时后重新开始匹配。 |
| `anchorCorner` | `anchor-corner` | `Corner` | `Corner.END_START` | 锚点用来对齐的角，写成「块方向-行方向」，例如 `end-start`。 |
| `menuCorner` | `menu-corner` | `Corner` | `Corner.START_START` | 菜单用来对齐的角，写成「块方向-行方向」，例如 `start-start`。 |
| `stayOpenOnOutsideClick` | `stay-open-on-outside-click` | `boolean` | `false` | 为真时，点菜单和锚点以外的地方不关闭。 |
| `stayOpenOnFocusout` | `stay-open-on-focusout` | `boolean` | `false` | 为真时，焦点离开菜单不关闭。 |
| `skipRestoreFocus` | `skip-restore-focus` | `boolean` | `false` | 为真时，关闭后不把焦点还回打开前的元素。 |
| `defaultFocus` | `default-focus` | `FocusState` | `FocusState.FIRST_ITEM` | 打开后焦点落在哪里。`none` 不动，`list-root` 落在列表，`first-item` 第一条，`last-item` 最后一条。 |
| `noNavigationWrap` | `no-navigation-wrap` | `boolean` | `false` | 为真时，键盘移到头或尾不再绕回。 |
| `theme` | `theme` | `"standard" \| "vibrant"` | `'standard'` | 配色。`standard` 或 `vibrant`，不是页面的亮色和暗色。 |
| `anchorElement` |  | `HTMLElement` | `null` | 锚点元素。写了 `anchor` 时以那个 id 为准。 |
| `items` |  | `MenuItem[]` | `undefined` | 菜单里的条目，按页面顺序。 |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### 方法

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `show` | 无 | `void` | 打开菜单。 |
| `close` | 无 | `void` | 关闭菜单。 |
| `reposition` | 无 | `void` | 按当前锚点重新计算位置。 |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

#### 事件

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| 事件 | 类型 | 冒泡 | 穿透 | 说明 |
| --- | --- | --- | --- | --- |
| `opening` | `Event` | 否 | 否 | 打开动画开始前 |
| `opened` | `Event` | 否 | 否 | 菜单已经打开 |
| `closing` | `Event` | 否 | 否 | 关闭动画开始前 |
| `closed` | `Event` | 否 | 否 | 菜单已经关闭 |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

### 组 <code>&lt;md-gen-menu-group&gt;</code>

一张圆角卡。没有属性，颜色跟着菜单的 theme。

### 条目 <code>&lt;md-gen-menu-item&gt;</code>
#### 属性

<!-- mdformat off(autogenerated might break rendering in catalog) -->

| 属性 | HTML 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | 禁用。整条 38% 透明，点了不关菜单，键盘跳过。 |
| `type` | `type` | `MenuItemType` | `'menuitem'` | 读屏角色。`menuitem`、`option`、`button`、`link`。不改外观。 |
| `href` | `href` | `string` | `''` | 链接地址。写了以后这一条渲染成链接。 |
| `target` | `target` | `string` | `''` | 链接打开位置。 |
| `rel` | `rel` | `string` | `''` | 链接的 rel。 |
| `referrerPolicy` | `referrerpolicy` | `string` | `''` | 链接的 referrer policy。 |
| `keepOpen` | `keep-open` | `boolean` | `false` | 为真时，点这一条不关菜单。 |
| `selected` | `selected` | `boolean` | `false` | 选中。只由页面设置，组件不互斥。同一侧带 `selected` 属性的图标跟着显示。 |
| `typeaheadText` |  | `string` | `undefined` | 键盘按字跳转时用来匹配的文字。不写就用条目里的文字。 |

<!-- mdformat on(autogenerated might break rendering in catalog) -->

<!-- auto-generated API docs end -->

### 插槽

适用于 `<md-gen-menu-item>`。组只有默认插槽，放条目。

| 名称 | 说明 |
| --- | --- |
| 默认 | 一行文字。过长时末尾省略号，不撑宽菜单 |
| `start` | 头部图标，20px，颜色跟文字。元素带 `selected` 时只在条目选中时显示。同一侧还有不带 `selected` 的图标，就互相替换。这一侧只有带 `selected` 的图标时，未选中不占位 |
| `end` | 尾部图标，规则和 `start` 相同 |

<!-- auto-generated theme docs start -->

## 主题

用组件 CSS 变量覆盖。下面只列出 Sass 里标记为支持的变量。

### 菜单 `<md-gen-menu>`

| 变量 | 默认值 |
| --- | --- |
| `--md-gen-menu-card-color` | `--md-sys-color-surface-container` |
| `--md-gen-menu-card-color-vibrant` | `--md-sys-color-tertiary-container` |
| `--md-gen-menu-card-padding-block` | `2px` |
| `--md-gen-menu-card-padding-inline` | `0px` |
| `--md-gen-menu-card-shape` | `16px` |
| `--md-gen-menu-gap` | `2px` |
| `--md-gen-menu-scrollbar-color` | `--md-sys-color-outline` |
| `--md-gen-menu-scrollbar-size` | `4px` |
| `--md-gen-menu-shadow` | `drop-shadow(0 1px 3px #0000004d) drop-shadow(0 4px 8px #00000026)` |
| `--md-gen-menu-width` | `208px` |

全部样式：[gen-menu/internal/_gen-menu.scss](https://github.com/CTOO-UXD/Web-GenV4/blob/main/gen-menu/internal/_gen-menu.scss)

### 组 `<md-gen-menu-group>`

| 变量 | 默认值 |
| --- | --- |
| `--md-gen-menu-group-container-color` | `--md-sys-color-surface-container` |
| `--md-gen-menu-group-container-color-vibrant` | `--md-sys-color-tertiary-container` |
| `--md-gen-menu-group-padding-block` | `2px` |
| `--md-gen-menu-group-padding-inline` | `0px` |
| `--md-gen-menu-group-shape` | `16px` |
| `--md-gen-menu-group-shape-multi` | `8px` |

全部样式：[gen-menu/internal/_gen-menu-group.scss](https://github.com/CTOO-UXD/Web-GenV4/blob/main/gen-menu/internal/_gen-menu-group.scss)

### 条目 `<md-gen-menu-item>`

| 变量 | 默认值 |
| --- | --- |
| `--md-gen-menu-item-disabled-opacity` | `0.38` |
| `--md-gen-menu-item-focus-opacity` | `0.1` |
| `--md-gen-menu-item-focus-ring-color` | `--md-sys-color-secondary` |
| `--md-gen-menu-item-focus-ring-selected-shape` | `14px` |
| `--md-gen-menu-item-focus-ring-shape` | `6px` |
| `--md-gen-menu-item-focus-ring-width` | `2px` |
| `--md-gen-menu-item-hover-color` | `--md-sys-color-on-surface` |
| `--md-gen-menu-item-hover-color-vibrant` | `--md-sys-color-on-tertiary-container` |
| `--md-gen-menu-item-hover-opacity` | `0.08` |
| `--md-gen-menu-item-icon-size` | `20px` |
| `--md-gen-menu-item-label-color` | `--md-sys-color-on-surface` |
| `--md-gen-menu-item-label-color-vibrant` | `--md-sys-color-on-tertiary-container` |
| `--md-gen-menu-item-label-line-height` | `20px` |
| `--md-gen-menu-item-label-size` | `14px` |
| `--md-gen-menu-item-label-tracking` | `0.1px` |
| `--md-gen-menu-item-label-weight` | `500` |
| `--md-gen-menu-item-padding-block` | `2px` |
| `--md-gen-menu-item-padding-inline` | `4px` |
| `--md-gen-menu-item-row-gap` | `8px` |
| `--md-gen-menu-item-row-height` | `44px` |
| `--md-gen-menu-item-row-padding-inline` | `12px` |
| `--md-gen-menu-item-selected-container-color` | `--md-sys-color-primary-fixed` |
| `--md-gen-menu-item-selected-container-color-vibrant` | `--md-sys-color-tertiary` |
| `--md-gen-menu-item-selected-hover-color` | `--md-sys-color-on-surface` |
| `--md-gen-menu-item-selected-hover-color-vibrant` | `--md-sys-color-on-tertiary` |
| `--md-gen-menu-item-selected-label-color` | `--md-sys-color-on-primary-fixed` |
| `--md-gen-menu-item-selected-label-color-vibrant` | `--md-sys-color-on-tertiary` |
| `--md-gen-menu-item-selected-shape` | `12px` |
| `--md-gen-menu-item-shape` | `4px` |

全部样式：[gen-menu/internal/_gen-menu-item.scss](https://github.com/CTOO-UXD/Web-GenV4/blob/main/gen-menu/internal/_gen-menu-item.scss)

<!-- auto-generated theme docs end -->

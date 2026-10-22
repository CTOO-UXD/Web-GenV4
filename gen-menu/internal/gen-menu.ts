/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {styleMap} from 'lit/directives/style-map.js';

import {
  ListController,
  NavigableKeys,
} from '../../list/internal/list-controller.js';
import {
  getFirstActivatableItem,
  getLastActivatableItem,
} from '../../list/internal/list-navigation-helpers.js';
import {type MenuItem} from '../../menu/internal/controllers/menuItemController.js';
import {FocusState} from '../../menu/internal/controllers/shared.js';
import {
  Corner,
  SurfacePositionController,
} from '../../menu/internal/controllers/surfacePositionController.js';
import {TypeaheadController} from '../../menu/internal/controllers/typeaheadController.js';

const DEFAULT_TYPEAHEAD_BUFFER_TIME = 200;

const menuNavKeys = new Set<string>([
  NavigableKeys.ArrowDown,
  NavigableKeys.ArrowUp,
  NavigableKeys.ArrowLeft,
  NavigableKeys.ArrowRight,
  NavigableKeys.Home,
  NavigableKeys.End,
]);

function getFocusedElement(
  activeDoc: Document | ShadowRoot = document,
): HTMLElement | null {
  let activeEl = activeDoc.activeElement as HTMLElement | null;
  while (activeEl && activeEl.shadowRoot?.activeElement) {
    activeEl = activeEl.shadowRoot.activeElement as HTMLElement | null;
  }
  return activeEl;
}

/**
 * 锚点旁边弹出的菜单。一张或几张圆角卡，整体一层阴影。
 *
 * @fires opening {Event} 打开动画开始前
 * @fires opened {Event} 菜单已经打开
 * @fires closing {Event} 关闭动画开始前
 * @fires closed {Event} 菜单已经关闭
 */
export class GenMenu extends LitElement {
  /**
   * 锚点元素的 id。和锚点要在同一个根节点里。
   *
   * @en Id of the anchor element in the same root node.
   */
  @property() anchor = '';

  /**
   * 相对谁定位。`absolute` 相对锚点的定位父级，`fixed` 相对窗口，`document` 相对文档，`popover` 用顶层，浏览器不支持时退回 `fixed`。
   *
   * @en Positioning context. `popover` falls back to `fixed` when unsupported.
   */
  @property() positioning: 'absolute' | 'fixed' | 'document' | 'popover' =
    'absolute';

  /**
   * 跳过打开和关闭动画。
   *
   * @en Skips the opening and closing animations.
   */
  @property({type: Boolean}) quick = false;

  /**
   * 为真时不裁剪内容，也不出现滚动条。
   *
   * @en Shows overflowing content and hides the scrollbar.
   */
  @property({type: Boolean, attribute: 'has-overflow'}) hasOverflow = false;

  /**
   * 菜单是否打开。
   *
   * @en Whether the menu is open.
   */
  @property({type: Boolean, reflect: true}) open = false;

  /**
   * 相对锚点的水平偏移，单位像素。从左到右时正数向右，从右到左时正数向左。
   *
   * @en Horizontal offset from the anchor in pixels. Direction aware.
   */
  @property({type: Number, attribute: 'x-offset'}) xOffset = 0;

  /**
   * 相对锚点的垂直偏移，单位像素。正数向下。
   *
   * @en Vertical offset from the anchor in pixels. Positive is downward.
   */
  @property({type: Number, attribute: 'y-offset'}) yOffset = 0;

  /**
   * 为真时，菜单在水平方向超出视口也不翻转。
   *
   * @en Keeps the horizontal corner when the menu would leave the viewport.
   */
  @property({type: Boolean, attribute: 'no-horizontal-flip'})
  noHorizontalFlip = false;

  /**
   * 为真时，菜单在垂直方向超出视口也不翻转。
   *
   * @en Keeps the vertical corner when the menu would leave the viewport.
   */
  @property({type: Boolean, attribute: 'no-vertical-flip'}) noVerticalFlip =
    false;

  /**
   * 键盘按字跳转时，两次按键之间最多隔多久，单位毫秒。超时后重新开始匹配。
   *
   * @en Max time in milliseconds between typeahead keystrokes.
   */
  @property({type: Number, attribute: 'typeahead-delay'})
  typeaheadDelay = DEFAULT_TYPEAHEAD_BUFFER_TIME;

  /**
   * 锚点用来对齐的角，写成「块方向-行方向」，例如 `end-start`。
   *
   * @en Anchor corner as block-inline, for example `end-start`.
   */
  @property({attribute: 'anchor-corner'}) anchorCorner: Corner =
    Corner.END_START;

  /**
   * 菜单用来对齐的角，写成「块方向-行方向」，例如 `start-start`。
   *
   * @en Menu corner as block-inline, for example `start-start`.
   */
  @property({attribute: 'menu-corner'}) menuCorner: Corner = Corner.START_START;

  /**
   * 为真时，点菜单和锚点以外的地方不关闭。
   *
   * @en Stays open when clicking outside the menu and anchor.
   */
  @property({type: Boolean, attribute: 'stay-open-on-outside-click'})
  stayOpenOnOutsideClick = false;

  /**
   * 为真时，焦点离开菜单不关闭。
   *
   * @en Stays open when focus leaves the menu.
   */
  @property({type: Boolean, attribute: 'stay-open-on-focusout'})
  stayOpenOnFocusout = false;

  /**
   * 为真时，关闭后不把焦点还回打开前的元素。
   *
   * @en Does not restore focus after closing.
   */
  @property({type: Boolean, attribute: 'skip-restore-focus'})
  skipRestoreFocus = false;

  /**
   * 打开后焦点落在哪里。`none` 不动，`list-root` 落在列表，`first-item` 第一条，`last-item` 最后一条。
   *
   * @en Where focus lands after opening.
   */
  @property({attribute: 'default-focus'}) defaultFocus: FocusState =
    FocusState.FIRST_ITEM;

  /**
   * 为真时，键盘移到头或尾不再绕回。
   *
   * @en Does not wrap keyboard navigation at the ends.
   */
  @property({type: Boolean, attribute: 'no-navigation-wrap'})
  noNavigationWrap = false;

  /**
   * 配色。`standard` 或 `vibrant`，不是页面的亮色和暗色。
   *
   * @en Color theme, `standard` or `vibrant`. Not the page light or dark theme.
   */
  @property({reflect: true}) theme: 'standard' | 'vibrant' = 'standard';

  @query('.menu') private readonly surfaceEl!: HTMLElement | null;
  @query('.items') private readonly itemsEl!: HTMLElement | null;
  @query('.bar') private readonly barEl!: HTMLElement | null;
  @query('.thumb') private readonly thumbEl!: HTMLElement | null;

  @state() private typeaheadActive = true;
  private renderedGroupCount = -1;

  private currentAnchorElement: HTMLElement | null = null;
  private lastFocusedElement: HTMLElement | null = null;

  private readonly listController = new ListController<MenuItem>({
    isItem: (maybeItem): maybeItem is MenuItem =>
      maybeItem.tagName === 'MD-GEN-MENU-ITEM',
    getPossibleItems: () => this.collectItems(),
    isRtl: () => getComputedStyle(this).direction === 'rtl',
    deactivateItem: (item) => {
      item.tabIndex = -1;
    },
    activateItem: (item) => {
      item.tabIndex = 0;
    },
    isNavigableKey: (key) => menuNavKeys.has(key),
    wrapNavigation: () => !this.noNavigationWrap,
  });

  private readonly typeaheadController = new TypeaheadController(() => {
    return {
      getItems: () => this.listController.items,
      typeaheadBufferTime: this.typeaheadDelay,
      active: this.typeaheadActive,
    };
  });

  private readonly positionController = new SurfacePositionController(
    this,
    () => {
      return {
        anchorCorner: this.anchorCorner,
        surfaceCorner: this.menuCorner,
        surfaceEl: this.surfaceEl,
        anchorEl: this.anchorElement,
        positioning:
          this.positioning === 'popover' ? 'document' : this.positioning,
        isOpen: this.open,
        xOffset: this.xOffset,
        yOffset: this.yOffset,
        disableBlockFlip: this.noVerticalFlip,
        disableInlineFlip: this.noHorizontalFlip,
        onOpen: this.onOpened,
        beforeClose: this.beforeClose,
        onClose: this.onClosed,
        repositionStrategy:
          this.hasOverflow && this.positioning !== 'popover' ? 'move' : 'resize',
      };
    },
  );

  constructor() {
    super();
    if (!isServer) {
      this.addEventListener('keydown', this.onKeydown);
      this.addEventListener('keydown', this.onKeydownCapture, {capture: true});
      this.addEventListener('focusout', this.onFocusout);
    }
  }

  /**
   * 锚点元素。写了 `anchor` 时以那个 id 为准。
   *
   * @en Anchor element. `anchor` wins when set.
   */
  get anchorElement(): HTMLElement | null {
    if (this.anchor) {
      return (this.getRootNode() as Document | ShadowRoot).querySelector(
        `#${this.anchor}`,
      );
    }
    return this.currentAnchorElement;
  }

  set anchorElement(element: HTMLElement | null) {
    this.currentAnchorElement = element;
    this.requestUpdate('anchorElement');
  }

  /**
   * 菜单里的条目，按页面顺序。
   *
   * @en Menu items in page order.
   */
  get items(): MenuItem[] {
    return this.listController.items;
  }

  /**
   * 打开菜单。
   *
   * @en Opens the menu.
   */
  show() {
    this.open = true;
  }

  /**
   * 关闭菜单。
   *
   * @en Closes the menu.
   */
  close() {
    this.open = false;
  }

  /**
   * 按当前锚点重新计算位置。
   *
   * @en Repositions the menu against its anchor.
   */
  reposition() {
    if (this.open) {
      this.positionController.position();
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('aria-hidden')) {
      this.setAttribute('aria-hidden', 'true');
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeGlobalListeners();
  }

  protected override willUpdate(changed: PropertyValues<GenMenu>) {
    if (
      changed.has('positioning') &&
      this.positioning === 'popover' &&
      !(this as unknown as {showPopover?: () => void}).showPopover
    ) {
      this.positioning = 'fixed';
    }
    if (changed.has('open')) {
      if (this.open) {
        this.removeAttribute('aria-hidden');
      } else {
        this.setAttribute('aria-hidden', 'true');
      }
    }
    this.renderedGroupCount = this.groupCount();
    this.toggleAttribute('multi-group', this.renderedGroupCount > 1);
  }

  protected override updated(changed: PropertyValues<GenMenu>) {
    if (changed.has('open')) {
      if (this.open) {
        this.addGlobalListeners();
      } else {
        this.removeGlobalListeners();
      }
    }
    this.syncScrollbar();
    // 服务端数不到组，会先渲染成单卡。class 绑定不会清掉这时留下的 single。
    this.itemsEl?.classList.toggle('single', this.groupCount() === 0);
  }

  protected override render() {
    const popover = this.positioning === 'popover' ? 'manual' : nothing;
    return html`
      <div
        class="menu ${classMap({
          fixed: this.positioning === 'fixed',
          document: this.positioning === 'document',
          open: this.open,
        })}"
        popover=${popover}
        style=${styleMap({
          ...this.positionController.surfaceStyles,
          'width': 'var(--_width)',
          'min-width': 'var(--_width)',
          'max-width': 'var(--_width)',
        })}>
        <div class=${this.groupCount() === 0 ? 'items single' : 'items'} tabindex="-1" @scroll=${this.syncScrollbar} role="menu">
          <slot
            @slotchange=${this.onSlotchange}
            @close-menu=${this.onCloseMenu}
            @deactivate-items=${this.onDeactivateItems}></slot>
        </div>
        <div class="bar" hidden>
          <div class="thumb"></div>
        </div>
      </div>
    `;
  }

  private collectItems(): HTMLElement[] {
    const items: HTMLElement[] = [];
    const walk = (node: Element) => {
      for (const child of Array.from(node.children)) {
        if (child.tagName === 'MD-GEN-MENU-ITEM') {
          items.push(child as HTMLElement);
        } else {
          walk(child);
        }
      }
    };
    walk(this);
    return items;
  }

  private groupCount() {
    if (isServer || !this.children) return 0;
    return Array.from(this.children).filter(
      (element) => element.tagName === 'MD-GEN-MENU-GROUP',
    ).length;
  }

  private onSlotchange = () => {
    this.listController.onSlotchange();
    if (this.groupCount() !== this.renderedGroupCount) {
      this.requestUpdate();
    }
    this.updateComplete.then(() => this.syncScrollbar());
  };

  private onCloseMenu = (event: Event) => {
    event.stopPropagation();
    this.close();
  };

  private onDeactivateItems = (event: Event) => {
    event.stopPropagation();
    this.listController.onDeactivateItems();
  };

  private onKeydown = (event: KeyboardEvent) => {
    this.listController.handleKeydown(event);
  };

  private onKeydownCapture = (event: KeyboardEvent) => {
    this.typeaheadController.onKeydown(event);
  };

  private onFocusout = (event: FocusEvent) => {
    if (this.stayOpenOnFocusout || !this.open) return;
    const next = event.relatedTarget;
    if (this.owns(next)) return;
    const anchor = this.anchorElement;
    if (next && anchor && this.owns(next, anchor)) return;
    this.close();
  };

  private owns(target: EventTarget | null, root: EventTarget = this) {
    if (!(target instanceof Node)) return false;
    let node: Node | null = target;
    while (node) {
      if (node === root) return true;
      const parentRoot = node.getRootNode();
      if (parentRoot instanceof ShadowRoot) {
        node = parentRoot.host;
      } else {
        node = node.parentNode;
      }
    }
    return false;
  }

  private readonly onDocumentClick = (event: Event) => {
    if (!this.open || this.stayOpenOnOutsideClick) return;
    const path = event.composedPath();
    if (path.includes(this)) return;
    const anchor = this.anchorElement;
    if (anchor && path.includes(anchor)) return;
    this.close();
  };

  private readonly onWindowResize = () => {
    if (
      this.positioning === 'document' ||
      this.positioning === 'fixed' ||
      this.positioning === 'popover'
    ) {
      this.reposition();
    }
  };

  private addGlobalListeners() {
    document.addEventListener('click', this.onDocumentClick, {capture: true});
    window.addEventListener('resize', this.onWindowResize);
  }

  private removeGlobalListeners() {
    document.removeEventListener('click', this.onDocumentClick, {capture: true});
    window.removeEventListener('resize', this.onWindowResize);
  }

  private readonly onOpened = async () => {
    this.lastFocusedElement = getFocusedElement();
    this.dispatchEvent(new Event('opening'));
    if (!this.quick && this.surfaceEl) {
      const animation = this.surfaceEl.animate([{opacity: 0}, {opacity: 1}], {
        duration: 120,
      });
      try {
        await animation.finished;
      } catch {
        // The close or a second open can cancel this fade.
      }
    }
    const items = this.items;
    if (this.defaultFocus === FocusState.FIRST_ITEM) {
      const first = getFirstActivatableItem(items);
      if (first) {
        first.tabIndex = 0;
        first.focus();
      }
    } else if (this.defaultFocus === FocusState.LAST_ITEM) {
      const last = getLastActivatableItem(items);
      if (last) {
        last.tabIndex = 0;
        last.focus();
      }
    } else if (this.defaultFocus === FocusState.LIST_ROOT) {
      this.itemsEl?.focus();
    }
    this.dispatchEvent(new Event('opened'));
    this.syncScrollbar();
  };

  private readonly beforeClose = async () => {
    this.dispatchEvent(new Event('closing'));
    if (!this.skipRestoreFocus) {
      this.lastFocusedElement?.focus?.();
    }
    if (!this.quick && this.surfaceEl) {
      const animation = this.surfaceEl.animate([{opacity: 1}, {opacity: 0}], {
        duration: 80,
      });
      try {
        await animation.finished;
      } catch {
        // The close or a second open can cancel this fade.
      }
    }
  };

  private readonly onClosed = () => {
    this.dispatchEvent(new Event('closed'));
  };

  private syncScrollbar = () => {
    const items = this.itemsEl;
    const bar = this.barEl;
    const thumb = this.thumbEl;
    if (!items || !bar || !thumb) return;
    const canScroll =
      !this.hasOverflow && items.scrollHeight > items.clientHeight + 1;
    bar.hidden = !canScroll;
    if (!canScroll) return;
    const ratio = items.clientHeight / items.scrollHeight;
    const track = bar.getBoundingClientRect().height;
    const thumbHeight = Math.min(Math.max(track * ratio, 16), track);
    const maxScroll = items.scrollHeight - items.clientHeight;
    const travel = Math.max(track - thumbHeight, 0);
    const top = maxScroll === 0 ? 0 : (items.scrollTop / maxScroll) * travel;
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${top}px)`;
  };
}

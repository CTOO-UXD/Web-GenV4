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
  @property() anchor = '';

  @property() positioning: 'absolute' | 'fixed' | 'document' | 'popover' =
    'absolute';

  @property({type: Boolean}) quick = false;

  @property({type: Boolean, attribute: 'has-overflow'}) hasOverflow = false;

  @property({type: Boolean, reflect: true}) open = false;

  @property({type: Number, attribute: 'x-offset'}) xOffset = 0;

  @property({type: Number, attribute: 'y-offset'}) yOffset = 0;

  @property({type: Boolean, attribute: 'no-horizontal-flip'})
  noHorizontalFlip = false;

  @property({type: Boolean, attribute: 'no-vertical-flip'}) noVerticalFlip =
    false;

  @property({type: Number, attribute: 'typeahead-delay'})
  typeaheadDelay = DEFAULT_TYPEAHEAD_BUFFER_TIME;

  @property({attribute: 'anchor-corner'}) anchorCorner: Corner =
    Corner.END_START;

  @property({attribute: 'menu-corner'}) menuCorner: Corner = Corner.START_START;

  @property({type: Boolean, attribute: 'stay-open-on-outside-click'})
  stayOpenOnOutsideClick = false;

  @property({type: Boolean, attribute: 'stay-open-on-focusout'})
  stayOpenOnFocusout = false;

  @property({type: Boolean, attribute: 'skip-restore-focus'})
  skipRestoreFocus = false;

  @property({attribute: 'default-focus'}) defaultFocus: FocusState =
    FocusState.FIRST_ITEM;

  @property({type: Boolean, attribute: 'no-navigation-wrap'})
  noNavigationWrap = false;

  @property({reflect: true}) theme: 'standard' | 'vibrant' = 'standard';

  @query('.menu') private readonly surfaceEl!: HTMLElement | null;
  @query('.items') private readonly itemsEl!: HTMLElement | null;
  @query('.bar') private readonly barEl!: HTMLElement | null;
  @query('.thumb') private readonly thumbEl!: HTMLElement | null;

  @state() private singleCard = true;
  @state() private typeaheadActive = true;

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

  get items(): MenuItem[] {
    return this.listController.items;
  }

  show() {
    this.open = true;
  }

  close() {
    this.open = false;
  }

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
        <div class="items ${classMap({single: this.singleCard})}" tabindex="-1" @scroll=${this.syncScrollbar} role="menu">
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

  private onSlotchange = () => {
    const slot = this.renderRoot.querySelector('slot');
    const assigned = slot?.assignedElements({flatten: true}) ?? [];
    const grouped = assigned.some(
      (element) => element.tagName === 'MD-GEN-MENU-GROUP',
    );
    if (this.singleCard === grouped) {
      this.singleCard = !grouped;
    }
    this.listController.onSlotchange();
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

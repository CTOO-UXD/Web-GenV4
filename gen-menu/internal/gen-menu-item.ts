/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, isServer, LitElement, nothing} from 'lit';
import {property, query, queryAssignedNodes} from 'lit/decorators.js';

import {
  MenuItemController,
  type MenuItemType,
} from '../../menu/internal/controllers/menuItemController.js';

/**
 * 菜单里的一行。文字一行，前后各能放图标。选中与否由页面设置。
 * 槽里带 selected 的图标只在选中时显示。
 */
export class GenMenuItem extends LitElement {
  /**
   * 禁用。整条 38% 透明，点了不关菜单，键盘跳过。
   *
   * @en Disables the item. The whole row is 38% opaque.
   */
  @property({type: Boolean, reflect: true}) disabled = false;

  /**
   * 读屏角色。`menuitem`、`option`、`button`、`link`。不改外观。
   *
   * @en Accessibility role. Does not change appearance.
   */
  @property() type: MenuItemType = 'menuitem';

  /**
   * 链接地址。写了以后这一条渲染成链接。
   *
   * @en Link URL. Renders the item as a link when set.
   */
  @property() href = '';

  /**
   * 链接打开位置。
   *
   * @en Where the link opens.
   */
  @property() target: '_blank' | '_parent' | '_self' | '_top' | '' = '';

  /**
   * 链接的 rel。
   *
   * @en The link rel.
   */
  @property() rel = '';

  /**
   * 链接的 referrer policy。
   *
   * @en The link referrer policy.
   */
  @property() referrerPolicy = '';

  /**
   * 为真时，点这一条不关菜单。
   *
   * @en Keeps the menu open when this item is chosen.
   */
  @property({type: Boolean, attribute: 'keep-open'}) keepOpen = false;

  /**
   * 选中。只由页面设置，组件不互斥。同一侧带 `selected` 属性的图标跟着显示。
   *
   * @en Selected state. Set only by the page. Shows slot icons marked selected.
   */
  @property({type: Boolean, reflect: true}) selected = false;

  @query('.row') private readonly rowEl!: HTMLElement | null;

  @queryAssignedNodes() private readonly defaultNodes!: Node[];

  /**
   * 键盘按字跳转时用来匹配的文字。不写就用条目里的文字。
   *
   * @en Text used for typeahead. Defaults to the item text.
   */
  get typeaheadText() {
    return this.menuItemController.typeaheadText;
  }

  @property({attribute: 'typeahead-text'})
  set typeaheadText(text: string) {
    this.menuItemController.setTypeaheadText(text);
  }

  private readonly menuItemController = new MenuItemController(this, {
    getHeadlineElements: () => [],
    getSupportingTextElements: () => [],
    getDefaultElements: () => this.defaultNodes,
    getInteractiveElement: () => this.rowEl,
  });

  constructor() {
    super();
    if (isServer) return;
    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeydown);
  }

  protected override willUpdate() {
    const role = this.type === 'option' ? 'option' : 'menuitem';
    this.setAttribute('role', role);
    if (this.type === 'option' && this.selected) {
      this.setAttribute('aria-selected', 'true');
    } else {
      this.removeAttribute('aria-selected');
    }
    if (this.disabled) {
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('aria-disabled');
    }
  }

  protected override updated() {
    this.syncSlots();
  }

  private syncSlots() {
    const root = this.renderRoot as ShadowRoot;
    for (const name of ['start', 'end']) {
      const slot = root.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
      if (!slot) continue;
      const assigned = slot.assignedElements({flatten: true});
      slot.toggleAttribute('hidden', assigned.length === 0);
      slot.toggleAttribute(
        'swap',
        assigned.some((element) => element.hasAttribute('selected')),
      );
    }
  }

  private readonly onClick = () => {
    if (this.disabled) return;
    this.menuItemController.onClick();
  };

  private readonly onKeydown = (event: KeyboardEvent) => {
    if (this.disabled) return;
    this.menuItemController.onKeydown(event);
  };

  private renderContent() {
    return html`
      <slot name="start" @slotchange=${this.syncSlots}></slot>
      <span class="label"><slot @slotchange=${this.syncSlots}></slot></span>
      <slot name="end" @slotchange=${this.syncSlots}></slot>
    `;
  }

  protected override render() {
    const content = this.renderContent();
    if (this.type === 'link' || this.href) {
      return html`
        <a
          class="row"
          tabindex="-1"
          href=${this.href || nothing}
          target=${this.target || nothing}
          rel=${this.rel || nothing}
          referrerpolicy=${this.referrerPolicy || nothing}>
          ${content}
        </a>
      `;
    }
    if (this.type === 'button') {
      return html`
        <button class="row" tabindex="-1" type="button">${content}</button>
      `;
    }
    return html`<div class="row">${content}</div>`;
  }
}

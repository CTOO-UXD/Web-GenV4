/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing} from 'lit';
import {property, query, queryAssignedNodes} from 'lit/decorators.js';

import {
  MenuItemController,
  type MenuItemType,
} from '../../menu/internal/controllers/menuItemController.js';

/**
 * 菜单里的一行。文字一行，前后各能放一个图标。选中与否由页面设置。
 */
export class GenMenuItem extends LitElement {
  @property({type: Boolean, reflect: true}) disabled = false;

  @property() type: MenuItemType = 'menuitem';

  @property() href = '';

  @property() target: '_blank' | '_parent' | '_self' | '_top' | '' = '';

  @property() rel = '';

  @property() referrerPolicy = '';

  @property({type: Boolean, attribute: 'keep-open'}) keepOpen = false;

  @property({type: Boolean, reflect: true}) selected = false;

  @query('.row') private readonly rowEl!: HTMLElement | null;

  @queryAssignedNodes() private readonly defaultNodes!: Node[];

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
      slot.toggleAttribute('hidden', slot.assignedNodes({flatten: true}).length === 0);
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

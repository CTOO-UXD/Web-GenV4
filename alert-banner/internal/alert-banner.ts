/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing} from 'lit';
import {property} from 'lit/decorators.js';

const ICONS = {
  default: 'campaign',
  informational: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
} as const;

/**
 * 内容上方的一条提示。配色由 scheme 决定，按钮和勾选框由页面放进插槽。
 *
 * @fires close {Event} 点关闭时发出。组件随即加上 hidden，不再占高度。组件不记住这次关闭，要不要再出现由页面决定。 --bubbles --composed @en Dispatched when the close button is pressed.
 * @en A banner above page content. scheme picks the colors. The page supplies buttons and a checkbox.
 */
export class AlertBanner extends LitElement {
  /**
   * 配色。取值 default、informational、success、warning、error。
   * @en Color scheme.
   */
  @property({reflect: true}) scheme:
    | 'default'
    | 'informational'
    | 'success'
    | 'warning'
    | 'error' = 'default';

  /**
   * 为真时加阴影。默认没有。
   * @en Adds a shadow when true.
   */
  @property({type: Boolean, reflect: true}) elevated = false;

  /**
   * 标题。空字符串不画这一行。
   * @en Title. An empty string omits the line.
   */
  @property() label = '';

  /**
   * 正文。空字符串不画这一行。
   * @en Supporting text. An empty string omits the line.
   */
  @property({attribute: 'supporting-text'}) supportingText = '';

  /**
   * 图标连字。空字符串时按 scheme 用默认图标。
   * @en Icon ligature. Empty uses the scheme default.
   */
  @property() icon = '';

  protected override willUpdate() {
    this.setAttribute('role', this.scheme === 'error' ? 'alert' : 'status');
  }

  protected override updated() {
    this.syncSlots();
  }

  private syncSlots() {
    const root = this.renderRoot as ShadowRoot;
    const actions = root.querySelector<HTMLElement>('.actions');
    const check = root.querySelector<HTMLElement>('.check');
    const side = root.querySelector<HTMLElement>('.side');
    const hasActions = hasAssigned(
      root.querySelector<HTMLSlotElement>('slot[name="actions"]')!,
    );
    const hasCheckbox = hasAssigned(
      root.querySelector<HTMLSlotElement>('slot[name="checkbox"]')!,
    );
    actions?.toggleAttribute('hidden', !hasActions);
    check?.toggleAttribute('hidden', !hasCheckbox);
    side?.toggleAttribute('hidden', !hasActions && !hasCheckbox);
  }

  private onClose() {
    this.dispatchEvent(new Event('close', {bubbles: true, composed: true}));
    this.hidden = true;
  }

  protected override render() {
    const iconName = this.icon || ICONS[this.scheme] || ICONS.default;
    const hasLabel = this.label !== '';
    const hasSupporting = this.supportingText !== '';
    return html`
      <div class="mark" aria-hidden="true">
        <md-icon>${iconName}</md-icon>
      </div>
      <div class="middle">
        <div class="copy" ?hidden=${!hasLabel && !hasSupporting}>
          ${hasLabel ? html`<div class="label">${this.label}</div>` : nothing}
          ${hasSupporting
            ? html`<div class="supporting">${this.supportingText}</div>`
            : nothing}
        </div>
        <div class="side">
          <div class="check">
            <slot name="checkbox" @slotchange=${this.syncSlots}></slot>
          </div>
          <div class="actions">
            <slot name="actions" @slotchange=${this.syncSlots}></slot>
          </div>
        </div>
      </div>
      <md-icon-button class="close" aria-label="关闭" @click=${this.onClose}>
        <md-icon>close</md-icon>
      </md-icon-button>
    `;
  }
}

function hasAssigned(slot: HTMLSlotElement) {
  return slot.assignedNodes({flatten: true}).some((node) => {
    return node.nodeType !== Node.TEXT_NODE || !!node.textContent?.trim();
  });
}

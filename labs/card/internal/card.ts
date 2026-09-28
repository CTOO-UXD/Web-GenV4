/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../../elevation/elevation.js';

import {html, LitElement, nothing} from 'lit';
import {property} from 'lit/decorators.js';

import {safeHref} from '../../../internal/directives/safe-href.js';

/**
 * A card component.
 *
 * @slot - Full-bleed media and other content.
 * @slot content - Text content, inset from the side edges.
 * @slot action - Controls that stay outside the primary link.
 */
export class Card extends LitElement {
  /** Destination for the card's primary action. */
  @property({reflect: true}) href = '';

  /** Disables the primary action. */
  @property({type: Boolean, reflect: true}) disabled = false;

  protected override render() {
    return html`
      <md-elevation part="elevation"></md-elevation>
      <div class="surface">
        <div class="background"></div>
        ${this.href ? this.renderPrimaryLink() : this.renderStaticContent()}
        <slot name="action"></slot>
        ${this.href ? html`<div class="state-layer"></div>` : nothing}
      </div>
      <div class="outline"></div>
    `;
  }

  private renderStaticContent() {
    return html`<slot></slot><slot name="content"></slot>`;
  }

  private renderPrimaryLink() {
    return html`<a
      class="primary"
      href=${this.disabled ? nothing : safeHref(this.href)}
      aria-disabled=${this.disabled ? 'true' : nothing}
      tabindex=${this.disabled ? -1 : nothing}
      @click=${this.handlePrimaryClick}
      >${this.renderStaticContent()}</a
    >`;
  }

  private handlePrimaryClick(event: MouseEvent) {
    if (!this.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }
}

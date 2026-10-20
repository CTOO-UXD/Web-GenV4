/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing, PropertyValues} from 'lit';
import {property, query, state} from 'lit/decorators.js';

import {
  DIALOG_DEFAULT_CLOSE_ANIMATION,
  DIALOG_DEFAULT_OPEN_ANIMATION,
  DialogAnimation,
  DialogAnimationArgs,
} from '../../dialog/internal/animations.js';

/**
 * A loading panel. `modal` covers the page. `inline` sits in the page.
 *
 * @fires open {Event} Dispatched when a modal is opening.
 * @fires opened {Event} Dispatched when a modal has opened.
 * @fires close {Event} Dispatched when a modal is closing.
 * @fires closed {Event} Dispatched when a modal has closed.
 * @fires cancel {Event} Dispatched when the cancel button is pressed.
 */
export class LoadingModal extends LitElement {
  @property({type: Boolean})
  get open() {
    return this.isOpen;
  }

  set open(open: boolean) {
    if (this.isInline || open === this.isOpen) {
      return;
    }

    this.isOpen = open;
    if (open) {
      this.setAttribute('open', '');
      this.requestUpdate();
      this.show();
      return;
    }

    this.removeAttribute('open');
    this.requestUpdate();
    this.close();
  }

  /** Which control closed the modal. Unchanged when canceled. */
  @property({attribute: false}) returnValue = '';

  @property({reflect: true}) size: 'large' | 'medium' | 'small' = 'large';

  @property({reflect: true}) container: 'modal' | 'inline' = 'modal';

  /** Shows the corner or row close button. The attribute is `close`. */
  @property({type: Boolean, reflect: true, attribute: 'close'})
  closeButton = false;

  /** Shows the filled cancel button. */
  @property({type: Boolean, reflect: true}) actions = false;

  /**
   * Replaces the spinner with a check. The panel stays open until `close()`.
   */
  @property({type: Boolean, reflect: true}) complete = false;

  @property() override title = '';

  getOpenAnimation = () => DIALOG_DEFAULT_OPEN_ANIMATION;
  getCloseAnimation = () => DIALOG_DEFAULT_CLOSE_ANIMATION;

  @state() private hasMessage = false;
  private isOpen = false;
  private isOpening = false;
  private isClosing = false;
  private isConnectedPromiseResolve!: () => void;
  private isConnectedPromise = this.getIsConnectedPromise();
  @query('dialog') private readonly dialog!: HTMLDialogElement | null;
  @query('.scrim') private readonly scrim!: HTMLElement | null;
  @query('.panel') private readonly panel!: HTMLElement | null;
  private cancelAnimations?: AbortController;

  get supportsControls() {
    return !this.isInline && this.size !== 'small';
  }

  private get isInline() {
    return this.container === 'inline';
  }

  async show() {
    if (this.isInline) {
      return;
    }

    this.isOpening = true;
    await this.isConnectedPromise;
    await this.updateComplete;
    const dialog = this.dialog;
    if (!dialog || dialog.open || !this.isOpening) {
      this.isOpening = false;
      return;
    }

    const preventOpen = !this.dispatchEvent(
      new Event('open', {cancelable: true}),
    );
    if (preventOpen) {
      this.markClosed();
      this.isOpening = false;
      return;
    }

    this.complete = false;
    this.isOpen = true;
    this.setAttribute('open', '');
    this.requestUpdate();
    await this.updateComplete;
    dialog.showModal();
    await this.animateDialog(this.getOpenAnimation());
    this.dispatchEvent(new Event('opened'));
    this.isOpening = false;
  }

  /**
   * Closes the modal. The scrim and Escape do not call this.
   */
  async close(returnValue = this.returnValue) {
    this.isOpening = false;
    const dialog = this.dialog;
    if (
      this.isInline ||
      !this.isConnected ||
      this.isClosing ||
      !dialog?.open
    ) {
      this.markClosed();
      return;
    }

    this.isClosing = true;
    const prevReturnValue = this.returnValue;
    this.returnValue = returnValue;
    const preventClose = !this.dispatchEvent(
      new Event('close', {cancelable: true}),
    );
    if (preventClose) {
      this.returnValue = prevReturnValue;
      this.isClosing = false;
      return;
    }

    await this.animateDialog(this.getCloseAnimation());
    dialog.close(returnValue);
    this.markClosed();
    this.isClosing = false;
    this.dispatchEvent(new Event('closed'));
  }

  override connectedCallback() {
    super.connectedCallback();
    this.isConnectedPromiseResolve();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.isConnectedPromise = this.getIsConnectedPromise();
  }

  protected override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('container') && this.isInline && this.dialog?.open) {
      this.dialog.close();
    }

    if (this.isInline && this.isOpen) {
      this.markClosed();
    }
  }

  protected override render() {
    const panel = this.renderPanel();
    const controls = html`<div class="controls"><slot name="controls"></slot></div>`;
    if (this.isInline) {
      return html`${controls}${panel}`;
    }

    return html`
      <div class="scrim" @click=${this.keepOpen}></div>
      <dialog
        aria-label=${this.title ? nothing : 'Loading'}
        aria-labelledby=${this.title && this.size !== 'small' ? 'title' : nothing}
        @cancel=${this.keepOpen}
        @close=${this.handleDialogClose}>
        ${panel}
        ${this.open ? controls : nothing}
      </dialog>
      ${this.open ? nothing : controls}
    `;
  }

  private renderPanel() {
    const showControls = this.supportsControls;
    return html`
      <div class="panel">
        ${this.container === 'modal' ? html`<md-elevation></md-elevation>` : nothing}
        <div class="body">
          <div class="content">
            <div class="indicator">
              <md-circular-progress
                ?indeterminate=${!this.complete}
                aria-hidden=${this.complete || nothing}
                aria-label=${this.complete ? nothing : 'Loading'}>
              </md-circular-progress>
              <md-icon
                class="check"
                aria-hidden=${this.complete ? nothing : 'true'}
                aria-label=${this.complete ? 'Complete' : nothing}
                >check_circle</md-icon>
            </div>
            ${this.size === 'small' ? nothing : this.renderText()}
          </div>
          ${showControls && this.closeButton
            ? html`<md-icon-button
                class="close"
                aria-label="Close"
                @click=${() => this.close('close')}>
                <md-icon>close</md-icon>
              </md-icon-button>`
            : nothing}
        </div>
        ${showControls && this.actions
          ? html`<div class="actions">
              <md-filled-button @click=${this.cancelFromControl}>
                <slot name="cancel"></slot>
              </md-filled-button>
            </div>`
          : nothing}
      </div>
    `;
  }

  private renderText() {
    const showText = Boolean(this.title) || this.hasMessage;
    return html`
      <div class="text" ?hidden=${!showText}>
        ${this.title
          ? html`<h2 id="title">${this.title}</h2>`
          : nothing}
        <div class="message" ?hidden=${!this.hasMessage}>
          <slot @slotchange=${this.syncMessage}></slot>
        </div>
      </div>
    `;
  }

  private syncMessage = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasMessage = slot.assignedNodes({flatten: true}).some((node) => {
      return (node.textContent ?? '').trim().length > 0;
    });
  };

  private cancelFromControl = () => {
    const proceed = this.dispatchEvent(
      new Event('cancel', {cancelable: true}),
    );
    if (!proceed) {
      return;
    }

    this.close();
  };

  /** Scrim clicks and Escape stay on the modal. */
  private keepOpen = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  private markClosed() {
    this.isOpen = false;
    this.removeAttribute('open');
    this.requestUpdate();
  }

  private handleDialogClose = () => {
    if (this.isClosing || this.isOpening) {
      return;
    }

    this.markClosed();
  };

  private async animateDialog(animation: DialogAnimation) {
    this.cancelAnimations?.abort();
    this.cancelAnimations = new AbortController();
    const pairs: Array<[Element | null, DialogAnimationArgs[] | undefined]> = [
      [this.dialog, animation.dialog],
      [this.scrim, animation.scrim],
      [this.panel, animation.container],
    ];
    const animations: Animation[] = [];
    for (const [element, args] of pairs) {
      if (!element || !args) {
        continue;
      }

      for (const animateArgs of args) {
        const running = element.animate(...animateArgs);
        this.cancelAnimations.signal.addEventListener('abort', () => {
          running.cancel();
        });
        animations.push(running);
      }
    }

    await Promise.all(
      animations.map((running) => running.finished.catch(() => {})),
    );
  }

  private getIsConnectedPromise() {
    return new Promise<void>((resolve) => {
      this.isConnectedPromiseResolve = resolve;
    });
  }
}

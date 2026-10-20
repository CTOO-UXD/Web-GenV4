/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing} from 'lit';
import {property, query, state} from 'lit/decorators.js';

import {redispatchEvent} from '../../internal/events/redispatch-event.js';
import {
  DIALOG_DEFAULT_CLOSE_ANIMATION,
  DIALOG_DEFAULT_OPEN_ANIMATION,
  DialogAnimation,
  DialogAnimationArgs,
} from '../../dialog/internal/animations.js';

import pageStyles from './hero-modal-page-styles.cssresult.js';

const SWIPE_DISTANCE = 40;
const DRAG_START = 4;
const WHEEL_IDLE = 280;

function ensurePageStyles(host: HTMLElement) {
  const root = host.getRootNode();
  if (!(root instanceof Document || root instanceof ShadowRoot)) {
    return;
  }
  if (root.adoptedStyleSheets.includes(pageStyles)) {
    return;
  }
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, pageStyles];
}

/**
 * A hero modal. Opening, the scrim, and focus trapping follow dialog.
 *
 * @fires open {Event} Dispatched when the modal is opening.
 * @fires opened {Event} Dispatched when the modal has opened.
 * @fires close {Event} Dispatched when the modal is closing.
 * @fires closed {Event} Dispatched when the modal has closed.
 * @fires cancel {Event} Dispatched when the scrim, Escape, or cancel closes it.
 */
export class HeroModal extends LitElement {
  @property({type: Boolean})
  get open() {
    return this.isOpen;
  }

  set open(open: boolean) {
    if (open === this.isOpen) {
      return;
    }

    this.isOpen = open;
    if (open) {
      this.setAttribute('open', '');
      this.show();
    } else {
      this.removeAttribute('open');
      this.close();
    }
  }

  /** Which control closed the modal. Empty when canceled. */
  @property({attribute: false}) returnValue = '';

  @property({reflect: true}) size: 'mobile' | 'tablet' | 'pc' = 'mobile';

  @property({reflect: true}) type: 'default' | 'walkthrough' = 'default';

  @property({type: Boolean, reflect: true, attribute: 'content-margin'})
  contentMargin = true;

  @property({type: Boolean, reflect: true, attribute: 'scroll-bar'})
  scrollBar = false;

  @property({type: Boolean, reflect: true, attribute: 'show-cancel'})
  showCancel = false;

  @property({type: Boolean, reflect: true, attribute: 'show-secondary-action'})
  showSecondaryAction = false;

  @property({type: Boolean, reflect: true, attribute: 'show-tertiary-action'})
  showTertiaryAction = false;

  @property({reflect: true}) tertiary: 'button' | 'checkbox' = 'button';

  /** Shows the corner close button. The attribute is `close`. */
  @property({type: Boolean, reflect: true, attribute: 'close'})
  closeButton = true;

  getOpenAnimation = () => DIALOG_DEFAULT_OPEN_ANIMATION;
  getCloseAnimation = () => DIALOG_DEFAULT_CLOSE_ANIMATION;

  @state() private index = 0;

  private isOpen = false;
  private isOpening = false;
  private isConnectedPromiseResolve!: () => void;
  private isConnectedPromise = this.getIsConnectedPromise();
  @query('dialog') private readonly dialog!: HTMLDialogElement | null;
  @query('.scrim') private readonly scrim!: HTMLElement | null;
  @query('.container') private readonly container!: HTMLElement | null;
  @query('.hero') private readonly hero!: HTMLElement | null;
  @query('.close') private readonly closeElement!: HTMLElement | null;
  @query('.pages') private readonly pages!: HTMLElement | null;
  @query('.default-actions, .walk') private readonly actions!: HTMLElement | null;
  @query('md-checkbox') private readonly checkbox!: HTMLElement & {
    checked: boolean;
  };
  @query('.focus-trap') private readonly firstFocusTrap!: HTMLElement | null;
  private nextClickIsFromContent = false;
  private cancelAnimations?: AbortController;
  private escapePressedWithoutCancel = false;
  private swipeX = Number.NaN;
  private swipeY = Number.NaN;
  private nextIconText: string | null = null;
  private wheelX = 0;
  private wheelLocked = false;
  private wheelTimer = 0;

  async show() {
    this.isOpening = true;
    await this.isConnectedPromise;
    await this.updateComplete;
    const dialog = this.dialog!;
    if (dialog.open || !this.isOpening) {
      this.isOpening = false;
      return;
    }

    const preventOpen = !this.dispatchEvent(
      new Event('open', {cancelable: true}),
    );
    if (preventOpen) {
      this.open = false;
      this.isOpening = false;
      return;
    }

    dialog.showModal();
    this.open = true;
    this.querySelector<HTMLElement>('[autofocus]')?.focus();
    await this.animateDialog(this.getOpenAnimation());
    this.dispatchEvent(new Event('opened'));
    this.isOpening = false;
  }

  /** Closes the modal. Scrim and Escape call this without a return value. */
  async close(returnValue = this.returnValue) {
    this.isOpening = false;
    if (!this.isConnected) {
      this.open = false;
      return;
    }

    await this.updateComplete;
    const dialog = this.dialog!;
    if (!dialog.open || this.isOpening) {
      this.open = false;
      return;
    }

    const prevReturnValue = this.returnValue;
    this.returnValue = returnValue;
    const preventClose = !this.dispatchEvent(
      new Event('close', {cancelable: true}),
    );
    if (preventClose) {
      this.returnValue = prevReturnValue;
      return;
    }

    await this.animateDialog(this.getCloseAnimation());
    dialog.close(returnValue);
    this.open = false;
    this.dispatchEvent(new Event('closed'));
  }

  override connectedCallback() {
    super.connectedCallback();
    ensurePageStyles(this);
    this.isConnectedPromiseResolve();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this.wheelTimer);
    this.isConnectedPromise = this.getIsConnectedPromise();
  }

  protected override updated() {
    this.applyPage();
  }

  protected override render() {
    const showFocusTrap = this.open;
    const focusTrap = html`<div
      class="focus-trap"
      tabindex="0"
      aria-hidden="true"
      @focus=${this.handleFocusTrapFocus}></div>`;

    return html`
      <div class="scrim"></div>
      <dialog
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
        @close=${this.handleClose}
        @keydown=${this.handleKeydown}>
        ${showFocusTrap ? focusTrap : nothing}
        <div
          class="container"
          @click=${this.handleContentClick}
          @pointerdown=${this.type === 'walkthrough' ? this.handlePointerDown : nothing}
          @pointermove=${this.type === 'walkthrough' ? this.handlePointerMove : nothing}
          @pointerup=${this.type === 'walkthrough' ? this.handlePointerUp : nothing}
          @pointercancel=${this.type === 'walkthrough' ? this.handlePointerCancel : nothing}
          @wheel=${this.type === 'walkthrough' ? this.handleWheel : nothing}>
          <md-elevation></md-elevation>
          <div class="clip">
            <div class="hero"><slot name="hero"></slot></div>
            <div class="main">
              <div class="pages">
                <slot @slotchange=${this.syncPages}></slot>
              </div>
              ${this.type === 'walkthrough'
                ? this.renderWalkthrough()
                : this.renderDefaultActions()}
            </div>
            ${this.closeButton
              ? html`<md-icon-button
                  class="close"
                  aria-label="Close"
                  @click=${() => this.close('close')}>
                  <md-icon>close</md-icon>
                </md-icon-button>`
              : nothing}
          </div>
        </div>
        ${showFocusTrap ? focusTrap : nothing}
      </dialog>
    `;
  }

  private renderDefaultActions() {
    return html`<div class="default-actions">
      ${this.renderTertiary()}
      <div class="end">
        ${this.showCancel
          ? html`<md-text-button @click=${this.cancelFromControl}>
              <slot name="cancel"></slot>
            </md-text-button>`
          : nothing}
        ${this.showSecondaryAction
          ? html`<md-outlined-button @click=${() => this.close('secondary')}>
              <slot name="secondary"></slot>
            </md-outlined-button>`
          : nothing}
        <md-filled-button @click=${() => this.close('primary')}>
          <slot name="primary"></slot>
        </md-filled-button>
      </div>
    </div>`;
  }

  private renderTertiary() {
    if (!this.showTertiaryAction) {
      return nothing;
    }
    if (this.tertiary === 'checkbox') {
      return html`<div class="start">
        <md-checkbox touch-target="none"></md-checkbox>
        <slot name="tertiary" @click=${this.toggleCheckbox}></slot>
      </div>`;
    }
    return html`<md-text-button
      class="start"
      @click=${() => this.close('tertiary')}>
      <slot name="tertiary"></slot>
    </md-text-button>`;
  }

  private renderWalkthrough() {
    return html`<div class="walk">
      <div class="dots">
        ${Array.from({length: this.pageElements().length}, (_, i) => {
          return html`<button
            class="dot"
            type="button"
            aria-label="Page ${i + 1}"
            aria-current=${i === this.index ? 'true' : nothing}
            ?current=${i === this.index}
            @click=${() => {
              this.index = i;
            }}></button>`;
        })}
      </div>
      <div class="navs">
        <div class="nav prev" ?hidden=${this.index === 0}>
          <slot name="previous" @click=${this.retreat}></slot>
        </div>
        <div class="nav">
          <slot name="next" @click=${this.advance}></slot>
        </div>
      </div>
    </div>`;
  }

  private syncPages = () => {
    const max = Math.max(0, this.pageElements().length - 1);
    if (this.index > max) {
      this.index = max;
      return;
    }
    this.requestUpdate();
  };

  private applyPage() {
    const current = this.type === 'walkthrough' ? this.index : 0;
    this.pageElements().forEach((page, i) => {
      page.toggleAttribute('data-current', i === current);
    });
    this.syncNextIcon();
  }

  private syncNextIcon() {
    const icon = this.querySelector('[slot="next"] md-icon');
    if (!(icon instanceof HTMLElement)) {
      return;
    }
    if (this.nextIconText === null) {
      this.nextIconText = icon.textContent?.trim() ?? '';
    }
    const pages = this.pageElements();
    const last =
      this.type === 'walkthrough' &&
      pages.length > 0 &&
      this.index >= pages.length - 1;
    icon.textContent = last ? 'check' : this.nextIconText;
  }

  private pageElements() {
    return [...this.children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.hasAttribute('slot'),
    );
  }

  private advance = () => {
    if (this.index >= this.pageElements().length - 1) {
      this.close('done');
      return;
    }
    this.move(1);
  };

  private retreat = () => {
    this.move(-1);
  };

  private move(step: number) {
    const count = this.pageElements().length;
    if (count === 0) {
      return;
    }
    this.index = Math.min(count - 1, Math.max(0, this.index + step));
  }

  private handlePointerDown = (event: PointerEvent) => {
    if (this.startsOnControl(event)) {
      this.swipeX = Number.NaN;
      return;
    }
    this.swipeX = event.clientX;
    this.swipeY = event.clientY;
  };

  private handlePointerMove = (event: PointerEvent) => {
    const current = event.currentTarget;
    if (
      !Number.isFinite(this.swipeX) ||
      !event.isTrusted ||
      !(current instanceof HTMLElement) ||
      current.hasPointerCapture(event.pointerId)
    ) {
      return;
    }
    const moved = Math.hypot(
      event.clientX - this.swipeX,
      event.clientY - this.swipeY,
    );
    if (moved >= DRAG_START) {
      current.setPointerCapture(event.pointerId);
    }
  };

  private handlePointerUp = (event: PointerEvent) => {
    if (!Number.isFinite(this.swipeX)) {
      return;
    }
    const delta = event.clientX - this.swipeX;
    this.swipeX = Number.NaN;
    if (delta <= -SWIPE_DISTANCE) {
      this.move(1);
    } else if (delta >= SWIPE_DISTANCE) {
      this.move(-1);
    }
  };

  private handlePointerCancel = () => {
    this.swipeX = Number.NaN;
  };

  private handleWheel = (event: WheelEvent) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
      return;
    }
    event.preventDefault();
    if (this.wheelLocked) {
      return;
    }
    this.wheelX += event.deltaX;
    window.clearTimeout(this.wheelTimer);
    if (Math.abs(this.wheelX) >= SWIPE_DISTANCE) {
      this.wheelLocked = true;
      this.move(this.wheelX > 0 ? 1 : -1);
      this.wheelX = 0;
    }
    this.wheelTimer = window.setTimeout(() => {
      this.wheelLocked = false;
      this.wheelX = 0;
    }, WHEEL_IDLE);
  };

  private startsOnControl(event: PointerEvent) {
    return event.composedPath().some((node) => {
      return (
        node instanceof Element &&
        node.matches('button, a, input, textarea, [role="button"]')
      );
    });
  }

  private toggleCheckbox = () => {
    if (!this.checkbox) {
      return;
    }
    this.checkbox.checked = !this.checkbox.checked;
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

  private handleDialogClick() {
    if (this.nextClickIsFromContent) {
      this.nextClickIsFromContent = false;
      return;
    }

    this.cancelFromControl();
  }

  private handleContentClick() {
    this.nextClickIsFromContent = true;
  }

  private handleCancel(event: Event) {
    if (event.target !== this.dialog) {
      return;
    }

    this.escapePressedWithoutCancel = false;
    const preventDefault = !redispatchEvent(this, event);
    event.preventDefault();
    if (preventDefault) {
      return;
    }

    this.close();
  }

  private handleClose() {
    if (!this.escapePressedWithoutCancel) {
      return;
    }

    this.escapePressedWithoutCancel = false;
    this.dialog?.dispatchEvent(new Event('cancel', {cancelable: true}));
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }

    this.escapePressedWithoutCancel = true;
    setTimeout(() => {
      this.escapePressedWithoutCancel = false;
    });
  }

  private async animateDialog(animation: DialogAnimation) {
    this.cancelAnimations?.abort();
    this.cancelAnimations = new AbortController();
    const pairs: Array<[Element | null, DialogAnimationArgs[] | undefined]> = [
      [this.dialog, animation.dialog],
      [this.scrim, animation.scrim],
      [this.container, animation.container],
      [this.hero, animation.headline],
      [this.closeElement, animation.headline],
      [this.pages, animation.content],
      [this.actions, animation.actions],
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

  private handleFocusTrapFocus(event: FocusEvent) {
    const [firstFocusableChild, lastFocusableChild] =
      this.getFirstAndLastFocusableChildren();
    if (!firstFocusableChild || !lastFocusableChild) {
      this.dialog?.focus();
      return;
    }

    const isFirstFocusTrap = event.target === this.firstFocusTrap;
    const focusCameFromFirstChild = event.relatedTarget === firstFocusableChild;
    const focusCameFromLastChild = event.relatedTarget === lastFocusableChild;
    const focusCameFromOutsideDialog =
      !focusCameFromFirstChild && !focusCameFromLastChild;
    const shouldFocusFirstChild =
      (!isFirstFocusTrap && focusCameFromLastChild) ||
      (isFirstFocusTrap && focusCameFromOutsideDialog);
    if (shouldFocusFirstChild) {
      firstFocusableChild.focus();
      return;
    }

    const shouldFocusLastChild =
      (isFirstFocusTrap && focusCameFromFirstChild) ||
      (!isFirstFocusTrap && focusCameFromOutsideDialog);
    if (shouldFocusLastChild) {
      lastFocusableChild.focus();
    }
  }

  private getFirstAndLastFocusableChildren():
    | [HTMLElement, HTMLElement]
    | [null, null] {
    const found: HTMLElement[] = [];
    if (this.shadowRoot) {
      this.collectFocusable(this.shadowRoot, found);
    }
    const first = found[0] ?? null;
    const last = found[found.length - 1] ?? null;
    return first && last ? [first, last] : [null, null];
  }

  private collectFocusable(node: ParentNode, found: HTMLElement[]) {
    const children =
      node instanceof HTMLSlotElement
        ? node.assignedElements({flatten: true})
        : [...node.children];
    for (const child of children) {
      if (!(child instanceof HTMLElement)) {
        continue;
      }
      if (child.classList.contains('focus-trap')) {
        continue;
      }
      if (isFocusable(child)) {
        found.push(child);
      }
      if (child.localName === 'slot' || !child.shadowRoot) {
        this.collectFocusable(child, found);
      }
    }
  }
}

function isFocusable(element: Element): element is HTMLElement {
  const knownFocusableElements =
    ':is(button,input,select,textarea,object,:is(a,area)[href],[tabindex],[contenteditable=true])';
  const notDisabled = ':not(:disabled,[disabled])';
  const notNegativeTabIndex = ':not([tabindex^="-"])';
  if (
    element.matches(knownFocusableElements + notDisabled + notNegativeTabIndex)
  ) {
    return true;
  }

  if (!element.localName.includes('-') || !element.matches(notDisabled)) {
    return false;
  }

  return element.shadowRoot?.delegatesFocus ?? false;
}

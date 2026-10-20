/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing} from 'lit';
import {property, query} from 'lit/decorators.js';

import {redispatchEvent} from '../../internal/events/redispatch-event.js';
import {
  DIALOG_DEFAULT_CLOSE_ANIMATION,
  DIALOG_DEFAULT_OPEN_ANIMATION,
  DialogAnimation,
  DialogAnimationArgs,
} from '../../dialog/internal/animations.js';

const ICONS = {
  neutral: 'interests',
  informational: 'info',
  success: 'check_circle',
  error: 'error',
  destructive: 'warning',
  system: 'system',
} as const;

/**
 * A modal panel. Opening, the scrim, and focus trapping follow dialog.
 *
 * @fires open {Event} 正要打开。调用 preventDefault 可以拦住。 @en Dispatched when the modal is opening.
 * @fires opened {Event} 打开动画结束后发出。 @en Dispatched when the modal has opened.
 * @fires close {Event} 正要关闭。调用 preventDefault 可以拦住。returnValue 表示是哪个控件关掉的。 @en Dispatched when the modal is closing.
 * @fires closed {Event} 关闭动画结束后发出。 @en Dispatched when the modal has closed.
 * @fires cancel {Event} 点遮罩、按 Esc 或点取消按钮时发出。调用 preventDefault 可以拦住。 @en Dispatched when the scrim, Escape, or the cancel button cancels the modal.
 */
export class Modal extends LitElement {
  /**
   * 是否打开。
   * @en Whether the modal is open.
   */
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

  /**
   * 关掉时写入。主按钮是 primary，次要是 secondary，第三操作是 tertiary，关闭按钮是 close。取消时为空。只能用脚本读写。
   * @en Which control closed the modal. Empty when canceled.
   */
  @property({attribute: false}) returnValue = '';

  /**
   * 外观。取值 neutral、informational、success、error、destructive、system。
   * @en Visual variant.
   */
  @property({reflect: true}) variant:
    | 'neutral'
    | 'informational'
    | 'success'
    | 'error'
    | 'destructive'
    | 'system' = 'neutral';

  /**
   * 宽度。narrow 最宽 448px，wide 最宽 640px。
   * @en Width. narrow max 448px, wide max 640px.
   */
  @property({reflect: true}) size: 'narrow' | 'wide' = 'narrow';

  /**
   * 正文是否留内容边距。默认开。要关掉只能在脚本里设为 false。
   * @en Whether body content keeps the content margin. Defaults to true.
   */
  @property({type: Boolean, reflect: true, attribute: 'content-margin'})
  contentMargin = true;

  /**
   * 底栏排列。取值 horizontal、vertical、horizontal-fill。
   * @en Footer layout.
   */
  @property({reflect: true}) layout:
    | 'horizontal'
    | 'vertical'
    | 'horizontal-fill' = 'horizontal';

  /**
   * 是否显示取消按钮。
   * @en Whether to show the cancel button.
   */
  @property({type: Boolean, reflect: true, attribute: 'show-cancel'})
  showCancel = false;

  /**
   * 是否显示次要按钮。
   * @en Whether to show the secondary action.
   */
  @property({type: Boolean, reflect: true, attribute: 'show-secondary-action'})
  showSecondaryAction = false;

  /**
   * 是否显示第三操作。
   * @en Whether to show the tertiary action.
   */
  @property({type: Boolean, reflect: true, attribute: 'show-tertiary-action'})
  showTertiaryAction = false;

  /**
   * 第三操作的样子。取值 button、checkbox。
   * @en Tertiary action form.
   */
  @property({reflect: true}) tertiary: 'button' | 'checkbox' = 'button';

  /**
   * 标题。
   * @en Title text.
   */
  @property() override title = '';

  /**
   * 标题前是否显示图标。默认开。要关掉只能在脚本里设为 false。
   * @en Whether to show the icon before the title. Defaults to true.
   */
  @property({type: Boolean, reflect: true, attribute: 'leading-item'})
  leadingItem = true;

  /**
   * 副标题。还要打开 show-subtitle 才会显示。
   * @en Subtitle text. Also requires show-subtitle.
   */
  @property() subtitle = '';

  /**
   * 是否显示副标题。
   * @en Whether to show the subtitle.
   */
  @property({type: Boolean, reflect: true, attribute: 'show-subtitle'})
  showSubtitle = false;

  /**
   * 是否显示右上角关闭按钮。HTML 属性是 close。
   * @en Whether to show the corner close button. The attribute is close.
   */
  @property({type: Boolean, reflect: true, attribute: 'close'})
  closeButton = false;

  getOpenAnimation = () => DIALOG_DEFAULT_OPEN_ANIMATION;
  getCloseAnimation = () => DIALOG_DEFAULT_CLOSE_ANIMATION;

  private isOpen = false;
  private isOpening = false;
  private isConnectedPromiseResolve!: () => void;
  private isConnectedPromise = this.getIsConnectedPromise();
  @query('dialog') private readonly dialog!: HTMLDialogElement | null;
  @query('.scrim') private readonly scrim!: HTMLElement | null;
  @query('.container') private readonly container!: HTMLElement | null;
  @query('.focus-trap') private readonly firstFocusTrap!: HTMLElement | null;
  @query('md-checkbox') private readonly checkbox!: HTMLElement & {
    checked: boolean;
  };
  private nextClickIsFromContent = false;
  private cancelAnimations?: AbortController;
  private escapePressedWithoutCancel = false;

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

  /**
   * Closes the modal. Scrim and Escape call this without a return value.
   */
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
    this.isConnectedPromiseResolve();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.isConnectedPromise = this.getIsConnectedPromise();
  }

  protected override render() {
    const showFocusTrap = this.open;
    const focusTrap = html`<div
      class="focus-trap"
      tabindex="0"
      aria-hidden="true"
      @focus=${this.handleFocusTrapFocus}></div>`;
    const hasHeader =
      this.leadingItem ||
      this.title ||
      (this.showSubtitle && this.subtitle) ||
      this.closeButton;

    return html`
      <div class="scrim"></div>
      <dialog
        aria-labelledby=${this.title ? 'title' : nothing}
        @cancel=${this.handleCancel}
        @click=${this.handleDialogClick}
        @close=${this.handleClose}
        @keydown=${this.handleKeydown}>
        ${showFocusTrap ? focusTrap : nothing}
        <div class="container" @click=${this.handleContentClick}>
          <md-elevation></md-elevation>
          ${hasHeader
            ? html`<header>
                ${this.leadingItem
                  ? html`<md-icon class="leading" aria-hidden="true"
                      >${ICONS[this.variant]}</md-icon
                    >`
                  : nothing}
                <div class="titles">
                  <h2 id="title">${this.title}</h2>
                  ${this.showSubtitle
                    ? html`<p class="subtitle">${this.subtitle}</p>`
                    : nothing}
                </div>
                ${this.closeButton
                  ? html`<md-icon-button
                      aria-label="Close"
                      @click=${() => this.close('close')}>
                      <md-icon>close</md-icon>
                    </md-icon-button>`
                  : nothing}
              </header>`
            : nothing}
          <div class="body"><slot></slot></div>
          <div class="actions">
            ${this.showTertiaryAction
              ? html`<div class="start">
                  ${this.tertiary === 'checkbox'
                    ? html`<div class="check">
                        <md-checkbox touch-target="none"></md-checkbox>
                        <slot
                          name="tertiary"
                          @click=${this.toggleCheckbox}></slot>
                      </div>`
                    : html`<md-text-button
                        @click=${() => this.close('tertiary')}>
                        <slot name="tertiary"></slot>
                      </md-text-button>`}
                </div>`
              : nothing}
            <div class="end">
              ${this.showCancel
                ? html`<md-text-button @click=${this.cancelFromControl}>
                    <slot name="cancel"></slot>
                  </md-text-button>`
                : nothing}
              ${this.showSecondaryAction
                ? html`<md-outlined-button
                    @click=${() => this.close('secondary')}>
                    <slot name="secondary"></slot>
                  </md-outlined-button>`
                : nothing}
              <md-filled-button @click=${() => this.close('primary')}>
                <slot name="primary"></slot>
              </md-filled-button>
            </div>
          </div>
        </div>
        ${showFocusTrap ? focusTrap : nothing}
      </dialog>
    `;
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

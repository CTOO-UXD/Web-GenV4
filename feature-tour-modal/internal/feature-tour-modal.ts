/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing} from 'lit';
import {property, query, state} from 'lit/decorators.js';

import {
  DIALOG_DEFAULT_CLOSE_ANIMATION,
  DIALOG_DEFAULT_OPEN_ANIMATION,
  DialogAnimation,
  DialogAnimationArgs,
} from '../../dialog/internal/animations.js';

import pageStyles from './feature-tour-modal-page-styles.cssresult.js';

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
 * A feature-tour card. It has no scrim and does not trap focus.
 *
 * @fires open {Event} 正要打开。调用 preventDefault 可以拦住。 @en Dispatched when the card is opening.
 * @fires opened {Event} 打开动画结束后发出。 @en Dispatched when the card has opened.
 * @fires close {Event} 正要关闭。调用 preventDefault 可以拦住。 @en Dispatched when the card is closing.
 * @fires closed {Event} 关闭动画结束后发出。 @en Dispatched when the card has closed.
 * @fires cancel {Event} 按 Esc 或点取消按钮时发出。没有遮罩。调用 preventDefault 可以拦住。 @en Dispatched when Escape or cancel closes it.
 * @fires page-change {CustomEvent<{page: number, previousPage: number}>} 用户翻页且页码变化时发出。脚本赋值不发。 --bubbles --composed
 */
export class FeatureTourModal extends LitElement {
  /**
   * 是否打开。默认关。
   * @en Whether the card is open.
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
      if (!this.isClosing) {
        this.close();
      }
    }
  }

  /**
   * 关掉时写入。主按钮是 primary，次要是 secondary，第三操作是 tertiary，关闭按钮是 close。取消钮、Esc 是 cancel。walkthrough 最后一页的下一步是 done。只能用脚本读写。
   * @en Which control closed the card. Cancel paths set cancel. The last walkthrough next sets done.
   */
  @property({attribute: false}) returnValue = '';

  /**
   * 箭头方向。取值 left、top、right、bottom。
   * @en Which side the caret sits on.
   */
  @property({reflect: true}) caret: 'left' | 'top' | 'right' | 'bottom' =
    'bottom';

  /**
   * 箭头靠起点、居中或靠终点。取值 start、center、end。
   * @en Where the caret sits along that side.
   */
  @property({reflect: true, attribute: 'caret-position'})
  caretPosition: 'start' | 'center' | 'end' = 'center';

  /**
   * default 是说明，walkthrough 是分页。previous 和 next 只在 walkthrough 出现。
   * @en default is one explanation. walkthrough pages through content.
   */
  @property({reflect: true}) type: 'default' | 'walkthrough' = 'default';

  /**
   * 正文是否留内容边距。默认开。要关掉只能在脚本里设为 false。
   * @en Whether body content keeps the content margin. Defaults to true.
   */
  @property({type: Boolean, reflect: true, attribute: 'content-margin'})
  contentMargin = true;

  /**
   * 内容超出时是否可以滚动。默认关，超出部分被裁掉。
   * @en Whether overflowing content can scroll.
   */
  @property({type: Boolean, reflect: true, attribute: 'scroll-bar'})
  scrollBar = false;

  /**
   * 是否显示取消按钮。只在 default 出现。
   * @en Whether to show the cancel button.
   */
  @property({type: Boolean, reflect: true, attribute: 'show-cancel'})
  showCancel = false;

  /**
   * 是否显示次要按钮。只在 default 出现。
   * @en Whether to show the secondary action.
   */
  @property({type: Boolean, reflect: true, attribute: 'show-secondary-action'})
  showSecondaryAction = false;

  /**
   * 是否显示第三操作。只在 default 出现。
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
   * 第三操作是勾选时，是否勾上。只在 default 底栏出现。
   * @en Whether the tertiary checkbox is checked. Shown on the default footer.
   */
  @property({type: Boolean, reflect: true, attribute: 'tertiary-checked'})
  tertiaryChecked = false;

  /**
   * 当前页，从 0 开始。脚本赋值不发 page-change。
   * @en Current page, starting at 0. Assigning it does not emit page-change.
   */
  @property({type: Number, reflect: true}) page = 0;

  /**
   * 是否显示主图上的关闭按钮。HTML 属性是 close。默认开。要关掉只能在脚本里设为 false。
   * @en Whether to show the close button on the hero. The attribute is close.
   */
  @property({type: Boolean, reflect: true, attribute: 'close'})
  closeButton = true;

  getOpenAnimation = () => DIALOG_DEFAULT_OPEN_ANIMATION;
  getCloseAnimation = () => DIALOG_DEFAULT_CLOSE_ANIMATION;


  private isOpen = false;
  private isOpening = false;
  private isClosing = false;
  private isConnectedPromiseResolve!: () => void;
  private isConnectedPromise = this.getIsConnectedPromise();
  @query('dialog') private readonly dialog!: HTMLDialogElement | null;
  @query('.container') private readonly container!: HTMLElement | null;
  @query('.hero') private readonly hero!: HTMLElement | null;
  @query('.close') private readonly closeElement!: HTMLElement | null;
  @query('.pages') private readonly pages!: HTMLElement | null;
  @query('.default-actions, .walk') private readonly actions!: HTMLElement | null;
  @query('md-checkbox') private readonly checkbox!: HTMLElement & {
    checked: boolean;
  };
  private cancelAnimations?: AbortController;
  private swipeX = Number.NaN;
  private swipeY = Number.NaN;
  @state() private hasNext = false;
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

    dialog.show();
    this.returnValue = '';
    this.page = 0;
    this.open = true;
    window.addEventListener('keydown', this.onEscape);
    await this.animateDialog(this.getOpenAnimation());
    this.dispatchEvent(new Event('opened'));
    this.isOpening = false;
  }

  /** Closes the card. Escape and cancel pass cancel. */
  async close(returnValue = this.returnValue) {
    if (this.isClosing) {
      return;
    }
    this.isClosing = true;
    this.isOpening = false;
    window.removeEventListener('keydown', this.onEscape);
    if (!this.isConnected) {
      this.isOpen = false;
      this.removeAttribute('open');
      this.isClosing = false;
      return;
    }

    const dialog = this.dialog;
    if (!dialog?.open || this.isOpening) {
      this.isOpen = false;
      this.removeAttribute('open');
      this.isClosing = false;
      this.dispatchEvent(new Event('closed'));
      return;
    }

    const prevReturnValue = this.returnValue;
    this.returnValue = returnValue;
    const preventClose = !this.dispatchEvent(
      new Event('close', {cancelable: true}),
    );
    if (preventClose) {
      this.returnValue = prevReturnValue;
      this.isClosing = false;
      window.addEventListener('keydown', this.onEscape);
      return;
    }

    await this.animateDialog(this.getCloseAnimation());
    if (dialog.open) {
      dialog.close(returnValue);
    }
    this.open = false;
    this.isClosing = false;
    this.dispatchEvent(new Event('closed'));
  }

  override connectedCallback() {
    super.connectedCallback();
    ensurePageStyles(this);
    this.isConnectedPromiseResolve();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.onEscape);
    window.clearTimeout(this.wheelTimer);
    this.isConnectedPromise = this.getIsConnectedPromise();
  }

  protected override updated() {
    this.applyPage();
  }

  protected override render() {
    return html`
      <dialog aria-modal="false" @cancel=${this.handleCancel}>
        <div
          class="container"
          @pointerdown=${this.type === 'walkthrough' ? this.handlePointerDown : nothing}
          @pointermove=${this.type === 'walkthrough' ? this.handlePointerMove : nothing}
          @pointerup=${this.type === 'walkthrough' ? this.handlePointerUp : nothing}
          @pointercancel=${this.type === 'walkthrough' ? this.handlePointerCancel : nothing}
          @wheel=${this.type === 'walkthrough' ? this.handleWheel : nothing}>
          <md-elevation></md-elevation>
          <div class="caret"></div>
          <div class="clip">
            <div class="visual">
              <div class="hero">
                <slot name="hero"></slot>
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
            <div class="main">
              <div class="pages">
                <slot @slotchange=${this.syncPages}></slot>
              </div>
              ${this.type === 'walkthrough'
                ? this.renderWalkthrough()
                : this.renderDefaultActions()}
            </div>
          </div>
        </div>
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
        <md-checkbox
          touch-target="none"
          .checked=${this.tertiaryChecked}
          @change=${this.onTertiaryChange}></md-checkbox>
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
            aria-current=${i === this.page ? 'true' : nothing}
            ?current=${i === this.page}
            @click=${() => {
              this.goTo(i);
            }}></button>`;
        })}
      </div>
      <div class="navs">
        <div class="nav prev" ?hidden=${this.page === 0}>
          <slot name="previous" @click=${this.retreat}></slot>
        </div>
        <div class="nav">
          <slot
            name="next"
            @slotchange=${this.onNextSlot}
            @click=${this.advance}></slot>
          ${this.onLastPage && !this.hasNext
            ? html`<md-icon-button type="button" aria-label="Next" @click=${this.advance}>
                <md-icon>check</md-icon>
              </md-icon-button>`
            : nothing}
        </div>
      </div>
    </div>`;
  }

  private syncPages = () => {
    const max = Math.max(0, this.pageElements().length - 1);
    if (this.page > max) {
      this.page = max;
      return;
    }
    this.requestUpdate();
  };

  private applyPage() {
    const current = this.type === 'walkthrough' ? this.page : 0;
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
    icon.textContent = this.onLastPage ? 'check' : this.nextIconText;
  }

  private pageElements() {
    return [...this.children].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && !el.hasAttribute('slot'),
    );
  }

  private advance = () => {
    if (this.page >= this.pageElements().length - 1) {
      this.close('done');
      return;
    }
    this.move(1);
  };

  private retreat = () => {
    this.move(-1);
  };

  private move(step: number) {
    this.goTo(this.page + step);
  }

  private goTo(next: number) {
    const count = this.pageElements().length;
    if (count === 0) {
      return;
    }
    const page = Math.min(count - 1, Math.max(0, next));
    if (page === this.page) {
      return;
    }
    const previousPage = this.page;
    this.page = page;
    this.dispatchEvent(
      new CustomEvent('page-change', {
        detail: {page, previousPage},
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onNextSlot = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasNext = slot.assignedElements({flatten: true}).length > 0;
  };

  private get onLastPage() {
    const pages = this.pageElements();
    return (
      this.type === 'walkthrough' &&
      pages.length > 0 &&
      this.page >= pages.length - 1
    );
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
    this.tertiaryChecked = !this.tertiaryChecked;
  };

  private onTertiaryChange = (event: Event) => {
    this.tertiaryChecked = (event.target as HTMLInputElement).checked;
  };

  private cancelFromControl = () => {
    if (!this.isOpen || this.isClosing) {
      return;
    }
    const proceed = this.dispatchEvent(
      new Event('cancel', {cancelable: true}),
    );
    if (!proceed) {
      return;
    }
    this.close('cancel');
  };

  private onEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }
    this.cancelFromControl();
  };

  private handleCancel(event: Event) {
    event.preventDefault();
    this.cancelFromControl();
  }

  private async animateDialog(animation: DialogAnimation) {
    this.cancelAnimations?.abort();
    this.cancelAnimations = new AbortController();
    const pairs: Array<[Element | null, DialogAnimationArgs[] | undefined]> = [
      [this.dialog, animation.dialog],
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
}

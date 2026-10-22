/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing} from 'lit';
import {property, query} from 'lit/decorators.js';

/**
 * 搜索栏。文字用原生单行输入，结果行由页面放进 results 插槽。
 *
 * @en Search bar. The text control is a native input. Result rows go in the results slot.
 *
 * @fires input {InputEvent} 文字变化，包含清除 --bubbles --composed
 * @fires submit {CustomEvent<{value: string}>} 按 Enter 或点击实心箭头。空值不发出 --bubbles --composed
 * @fires mic {CustomEvent} 点击麦克风。组件不识别语音 --bubbles --composed
 */
export class SearchBar extends LitElement {
  /**
   * 输入框里的文字。只有空格时视为没有文字。
   *
   * @en Text in the field. Whitespace alone counts as empty.
   */
  @property() value = '';

  /**
   * 没有文字时的占位内容。默认空，由页面填写。
   *
   * @en Placeholder when the field is empty. Empty by default.
   */
  @property() placeholder = '';

  /**
   * 结果区是否展开。开关由页面设置。
   *
   * @en Whether the results area is open. The page controls this.
   */
  @property({type: Boolean, reflect: true}) open = false;

  @query('input') private textField!: HTMLInputElement;
  @query('.items') private itemsEl!: HTMLElement | null;
  @query('.scrollbar') private scrollbarEl!: HTMLElement | null;
  @query('.thumb') private thumbEl!: HTMLElement | null;

  private resizeObserver?: ResizeObserver;

  override connectedCallback() {
    if (!this.resizeObserver && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.syncScrollbar();
      });
    }
    super.connectedCallback();
  }

  private get hasText() {
    return this.value.trim().length > 0;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override updated() {
    if (this.itemsEl) {
      this.resizeObserver?.observe(this.itemsEl);
    } else {
      this.resizeObserver?.disconnect();
    }
    this.syncScrollbar();
  }

  protected override render() {
    return html`
      <div class="capsule">
        <div class="bar-row">
          <div class="field">
            <span class="leading"><md-icon>search</md-icon></span>
            <input
              type="text"
              .value=${this.value}
              placeholder=${this.placeholder}
              aria-label="搜索"
              @input=${this.onInput}
              @keydown=${this.onKeydown}
            />
            ${this.hasText
              ? html`<md-filled-tonal-icon-button
                  class="clear"
                  aria-label="清除"
                  @click=${this.clearText}
                >
                  <md-icon>close</md-icon>
                </md-filled-tonal-icon-button>`
              : html`<md-icon-button
                  class="mic"
                  aria-label="麦克风"
                  @click=${this.onMic}
                >
                  <md-icon>mic</md-icon>
                </md-icon-button>`}
          </div>
          <div class="submit">
            ${this.hasText
              ? html`<md-filled-icon-button
                  class="filled"
                  aria-label="提交"
                  @click=${this.submit}
                >
                  <md-icon>arrow_forward</md-icon>
                </md-filled-icon-button>`
              : html`<md-icon-button class="empty" aria-label="提交">
                  <md-icon>arrow_forward</md-icon>
                </md-icon-button>`}
          </div>
        </div>
        ${this.open
          ? html`<div class="results">
              <div class="items" @scroll=${this.syncScrollbar}>
                <slot name="results" @slotchange=${this.syncScrollbar}></slot>
              </div>
              <div class="scrollbar" hidden>
                <div class="thumb"></div>
              </div>
            </div>`
          : nothing}
      </div>
    `;
  }

  private onInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.isComposing) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  private submit() {
    if (!this.hasText) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('submit', {
        detail: {value: this.value},
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onMic() {
    this.dispatchEvent(new CustomEvent('mic', {bubbles: true, composed: true}));
  }

  private clearText() {
    this.value = '';
    this.textField.value = '';
    this.textField.focus();
    this.textField.dispatchEvent(
      new Event('input', {bubbles: true, composed: true}),
    );
  }

  private syncScrollbar = () => {
    const items = this.itemsEl;
    const scrollbar = this.scrollbarEl;
    const thumb = this.thumbEl;
    if (!items || !scrollbar || !thumb) {
      return;
    }
    const canScroll = items.scrollHeight > items.clientHeight + 1;
    scrollbar.hidden = !canScroll;
    if (!canScroll) {
      return;
    }
    const parsedMin = parseFloat(getComputedStyle(thumb).minHeight);
    const minThumb = Number.isNaN(parsedMin) ? 0 : parsedMin;
    const ratio = items.clientHeight / items.scrollHeight;
    const track = scrollbar.getBoundingClientRect().height;
    const thumbHeight = Math.min(Math.max(track * ratio, minThumb), track);
    const maxScroll = items.scrollHeight - items.clientHeight;
    const travel = Math.max(track - thumbHeight, 0);
    const top = maxScroll === 0 ? 0 : (items.scrollTop / maxScroll) * travel;
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${top}px)`;
  };
}

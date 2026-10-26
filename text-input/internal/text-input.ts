/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement, PropertyValues, html, nothing} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {live} from 'lit/directives/live.js';

import {redispatchEvent} from '../../internal/events/redispatch-event.js';
import {
  createValidator,
  getValidityAnchor,
  mixinConstraintValidation,
} from '../../labs/behaviors/constraint-validation.js';
import {mixinElementInternals} from '../../labs/behaviors/element-internals.js';
import {
  getFormValue,
  mixinFormAssociated,
} from '../../labs/behaviors/form-associated.js';
import {
  mixinOnReportValidity,
  onReportValidity,
} from '../../labs/behaviors/on-report-validity.js';
import {TextFieldValidator} from '../../labs/behaviors/validators/text-field-validator.js';
import {Validator} from '../../labs/behaviors/validators/validator.js';

const textInputBaseClass = mixinOnReportValidity(
  mixinConstraintValidation(
    mixinFormAssociated(mixinElementInternals(LitElement)),
  ),
);

/**
 * 单行文本输入。
 *
 * @en A single-line text input.
 *
 * @fires input {InputEvent} 文字变化时触发。
 * --bubbles --composed
 * @fires change {Event} 文字提交时触发。
 * --bubbles
 * @fires send {CustomEvent<{value: string}>} 仅 `<md-action-input>`。有文字时点击或按 Enter 发送，detail.value 是当前文字，文字留在框里。空的、只有空格的、禁用的不发。
 * --bubbles --composed
 */
export class TextInput extends textInputBaseClass {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /**
   * 框内的标签。
   *
   * @en The label shown inside the field.
   */
  @property() label = '';

  /**
   * 当前文字。不反映到属性上，表单重置时可以恢复初始值。
   *
   * @en The current value. Does not reflect, so a form reset can restore it.
   */
  @property() value = '';

  /**
   * 没有文字时显示的占位内容。
   *
   * @en Text shown when the field is empty.
   */
  @property() placeholder = '';

  /**
   * 框下面的说明。为空时不显示。
   *
   * @en Helper text below the field. Hidden when empty.
   */
  @property({attribute: 'supporting-text'}) supportingText = '';

  /**
   * 显示出错外观。设置了 `errorText` 时，用它替换说明。
   *
   * @en Shows the error outline. With `errorText`, replaces the helper text.
   */
  @property({type: Boolean, reflect: true}) error = false;

  /**
   * 错误文案。为空时，校验失败后显示浏览器的提示。
   *
   * @en Error copy. When empty, a reported native validation message is used.
   */
  @property({attribute: 'error-text'}) errorText = '';

  /**
   * 最多可输入的字符数。`-1` 表示不限制，也不显示字数。
   *
   * @en The maximum number of characters. `-1` means no limit.
   */
  @property({type: Number}) maxLength = -1;

  /**
   * 必填。标签后不加星号。
   *
   * @en Whether the field is required. Does not render an asterisk.
   */
  @property({type: Boolean, reflect: true}) required = false;

  /**
   * 只读。外观不变，不能改字。聚焦时不出现清除。
   *
   * @en Whether the field is read-only.
   */
  @property({type: Boolean, reflect: true}) readOnly = false;

  /**
   * 原样交给内部输入框，由浏览器决定是否填入本机保存的资料。
   *
   * @en Passed through to the inner input.
   */
  @property() autocomplete = '';

  @state() private nativeError = false;
  @state() private nativeErrorText = '';

  @query('.control') private readonly control!:
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;

  /** Action input renders a send button. Text input does not. */
  protected showsSend = false;

  /** Text area renders a multiline control and no clear button. */
  protected showsClear = true;
  protected multiline = false;

  private get stacked() {
    return this.value.length > 0 || this.placeholder.length > 0;
  }

  private get showErrorChrome() {
    return !this.disabled && (this.error || this.nativeError);
  }

  private get canSend() {
    return this.value.trim().length > 0 && !this.disabled;
  }

  private get message(): {text: string; error: boolean} | null {
    if (this.error || this.nativeError) {
      const text = this.errorText || (this.nativeError ? this.nativeErrorText : '');
      return text ? {text, error: true} : null;
    }

    return this.supportingText ? {text: this.supportingText, error: false} : null;
  }

  protected override render() {
    const message = this.message;
    const showClear = this.showsClear && !this.readOnly && !this.disabled;
    const control = this.multiline
      ? html`<textarea
          class="control"
          rows="1"
          .value=${live(this.value)}
          placeholder=${this.placeholder || nothing}
          autocomplete=${this.autocomplete || nothing}
          ?disabled=${this.disabled}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          maxlength=${this.maxLength > -1 ? this.maxLength : nothing}
          aria-invalid=${this.showErrorChrome ? 'true' : 'false'}
          aria-describedby=${message ? 'support' : nothing}
          @input=${this.onInput}
          @change=${this.onChange}></textarea>`
      : html`<input
          class="control"
          type="text"
          .value=${live(this.value)}
          placeholder=${this.placeholder || nothing}
          autocomplete=${this.autocomplete || nothing}
          ?disabled=${this.disabled}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          maxlength=${this.maxLength > -1 ? this.maxLength : nothing}
          aria-invalid=${this.showErrorChrome ? 'true' : 'false'}
          aria-describedby=${message ? 'support' : nothing}
          @input=${this.onInput}
          @change=${this.onChange}
          @keydown=${this.onControlKeydown} />`;
    return html`
      <div
        class="root ${classMap({
          'can-send': this.canSend,
          disabled: this.disabled,
          invalid: this.showErrorChrome,
          stacked: this.stacked,
        })}">
        <div class="field">
          <label class="text">
            <span class="label">${this.label}</span>
            ${control}
          </label>
          ${showClear
            ? html`<md-icon-button
                class="clear"
                type="button"
                tabindex="-1"
                aria-label="清除"
                @mousedown=${this.keepFocus}
                @click=${this.clear}>
                <md-icon>cancel</md-icon>
              </md-icon-button>`
            : nothing}
          ${this.showsSend
            ? html`<md-icon-button
                class="send"
                type="button"
                aria-label="发送"
                @click=${this.onSend}>
                <md-icon>send</md-icon>
              </md-icon-button>`
            : nothing}
        </div>
        ${message
          ? html`<p id="support" class="supporting ${classMap({error: message.error})}">
              ${message.error ? html`<md-icon>error</md-icon>` : nothing}
              <span>${message.text}</span>
            </p>`
          : nothing}
      </div>
    `;
  }

  protected override updated(changed: PropertyValues) {
    super.updated(changed);
    this.fitArea();
  }

  private onInput(event: InputEvent) {
    this.value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    redispatchEvent(this, event);
  }

  private onChange(event: Event) {
    redispatchEvent(this, event);
  }

  private keepFocus(event: Event) {
    event.preventDefault();
  }

  private clear() {
    const hadText = this.value.length > 0;
    this.value = '';
    this.control?.focus();
    if (hadText) {
      this.dispatchEvent(new InputEvent('input', {bubbles: true, composed: true}));
    }
  }

  /** Grows the textarea up to three lines. Further lines scroll inside it. */
  private fitArea() {
    const area = this.control;
    if (!this.multiline || !(area instanceof HTMLTextAreaElement)) {
      return;
    }

    const line = parseFloat(getComputedStyle(area).lineHeight) || 24;
    const max = line * 3;
    area.style.height = 'auto';
    const full = area.scrollHeight;
    area.style.height = `${Math.min(Math.max(full, line), max)}px`;
    area.style.overflowY = full > max ? 'auto' : 'hidden';
  }

  private onControlKeydown(event: KeyboardEvent) {
    if (!this.showsSend || event.key !== 'Enter' || event.shiftKey || event.isComposing) {
      return;
    }
    event.preventDefault();
    this.onSend();
  }

  private onSend() {
    if (!this.canSend) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent('send', {
        detail: {value: this.value},
        bubbles: true,
        composed: true,
      }),
    );
  }

  declare disabled: boolean;
  declare name: string;

  override [getFormValue]() {
    return this.value;
  }

  override formResetCallback() {
    this.value = this.getAttribute('value') ?? '';
    this.nativeError = false;
    this.nativeErrorText = '';
  }

  override formStateRestoreCallback(state: string) {
    this.value = state;
  }

  override [createValidator](): Validator<unknown> {
    return new TextFieldValidator(() => ({
      state: this.multiline
        ? {
            type: 'textarea',
            value: this.value,
            required: this.required,
            minLength: -1,
            maxLength: this.maxLength,
          }
        : {
            type: 'text',
            value: this.value,
            required: this.required,
            minLength: -1,
            maxLength: this.maxLength,
            pattern: '',
            min: '',
            max: '',
            step: '',
          },
      renderedControl: this.control,
    }));
  }

  override [getValidityAnchor]() {
    return this.control;
  }

  override [onReportValidity](invalidEvent: Event | null) {
    invalidEvent?.preventDefault();
    this.nativeError = !!invalidEvent;
    this.nativeErrorText = invalidEvent ? this.validationMessage : '';
  }
}

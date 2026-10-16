/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing} from 'lit';
import {property, query, state} from 'lit/decorators.js';

interface Attachment {
  file: File;
  url: string;
}

/**
 * AI 输入框。文字用原生 textarea。
 *
 * @en AI composer. The text control is a native textarea.
 *
 * @fires send {CustomEvent} 点击发送。detail 含 value 和 files --bubbles --composed
 * @fires interrupt {CustomEvent} 发送中点击停止 --bubbles --composed
 * @fires files-change {CustomEvent} 已选文件变化。detail 含 files --bubbles --composed
 */
export class AiInput extends LitElement {
  /**
   * 输入框里的文字。只有空格时视为没有文字。
   *
   * @en Text in the field. Whitespace alone counts as empty.
   */
  @property() value = '';

  /**
   * 没有文字时的占位内容。听写中改为 i'm listening...。
   *
   * @en Placeholder when the field is empty. Listening shows i'm listening...
   */
  @property() placeholder = 'Ask anything or search...';

  /**
   * 输入框下方的说明。
   *
   * @en Disclaimer under the field.
   */
  @property() disclaimer =
    'AI can make mistakes and may not be suitable for some minors.';

  /**
   * 发送进行中。按钮变为停止，文字不可改，清除禁用。回复结束时由页面设回 false。
   *
   * @en Sending. The button becomes stop, text is read-only, and clear is disabled. The page sets this to false when the reply ends.
   */
  @property({type: Boolean, reflect: true}) thinking = false;

  /**
   * 听写外观。页面可以设置，麦克风点击也会切换。组件不调用语音接口。
   *
   * @en Listening appearance. The page may set it, and the microphone toggles it. The component does not call speech APIs.
   */
  @property({type: Boolean, reflect: true}) listening = false;

  @state() private menuOpen = false;

  @state() private attachments: Attachment[] = [];

  @query('textarea') private textArea!: HTMLTextAreaElement;

  /**
   * 已选择的文件。只读，选择或移除文件时更新。
   *
   * @en Selected files. Read-only. Updated when files are chosen or removed.
   */
  get files(): readonly File[] {
    return this.attachments.map((item) => item.file);
  }

  private get hasText() {
    return this.value.trim().length > 0;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    for (const item of this.attachments) {
      URL.revokeObjectURL(item.url);
    }
  }

  protected override updated() {
    const field = this.textArea;
    if (!field) {
      return;
    }
    const max = parseFloat(getComputedStyle(field).maxHeight);
    const line = parseFloat(getComputedStyle(field).lineHeight) || 20;
    field.style.height = 'auto';
    const full = field.scrollHeight;
    const capped = Number.isFinite(max)
      ? Math.min(Math.max(full, line), max)
      : Math.max(full, line);
    field.style.height = `${capped}px`;
    field.style.overflowY = Number.isFinite(max) && full > max ? 'auto' : 'hidden';
    field.closest('.entry')?.classList.toggle('multiline', full > line + 1);
  }

  protected override render() {
    const images = this.attachments.filter((item) =>
      item.file.type.startsWith('image/'),
    );
    const files = this.attachments.filter(
      (item) => !item.file.type.startsWith('image/'),
    );

    return html`
      <div class="main">
        <div class="frame">
          <div class="field" part="field">
          ${images.length
            ? html`<div class="images" role="list" aria-label="图片">
                ${images.map((item) => this.renderImage(item))}
              </div>`
            : nothing}
          ${files.length
            ? html`<div class="files" role="list" aria-label="文件">
                ${files.map((item) => this.renderFile(item))}
              </div>`
            : nothing}
          <div class="entry">
            <div class="add">
              <md-icon-button
                aria-label="添加"
                aria-expanded=${this.menuOpen ? 'true' : 'false'}
                @click=${this.toggleMenu}
              >
                <md-icon>add</md-icon>
              </md-icon-button>
              ${this.menuOpen
                ? html`<div class="menu">
                    <md-text-button @click=${this.openPicker}>上传文件</md-text-button>
                  </div>`
                : nothing}
            </div>
            <div class="text">
              <textarea
                .value=${this.value}
                placeholder=${this.listening ? "i'm listening..." : this.placeholder}
                rows="1"
                ?readonly=${this.thinking}
                @input=${this.onInput}
              ></textarea>
            </div>
            <div class="cluster">
              ${this.hasText
                ? html`<md-filled-tonal-icon-button
                    class="clear"
                    aria-label="清除"
                    ?disabled=${this.thinking}
                    @click=${this.clearText}
                  >
                    <md-icon>close</md-icon>
                  </md-filled-tonal-icon-button>`
                : nothing}
              <md-icon-button
                class="mic"
                aria-label="听写"
                @click=${this.toggleListening}
              >
                <md-icon>mic-ai</md-icon>
              </md-icon-button>
              <md-filled-icon-button
                class="send ${this.hasText ? 'has-text' : ''}"
                aria-label=${this.thinking ? '停止' : '发送'}
                ?disabled=${!this.thinking && (this.listening || !this.hasText)}
                @click=${this.onSend}
              >
                <md-icon>${this.thinking ? 'stop' : 'arrow_forward'}</md-icon>
              </md-filled-icon-button>
            </div>
          </div>
          </div>
        </div>
      </div>
      <p class="disclaimer" part="disclaimer">${this.disclaimer}</p>
      <input
        type="file"
        multiple
        hidden
        @change=${this.onFiles}
      />
    `;
  }

  private renderImage(item: Attachment) {
    return html`<div role="listitem" class="image">
      <img alt=${item.file.name} src=${item.url} />
      <md-filled-tonal-icon-button
        aria-label="移除 ${item.file.name}"
        @click=${() => this.removeAttachment(item)}
      >
        <md-icon>close</md-icon>
      </md-filled-tonal-icon-button>
    </div>`;
  }

  private renderFile(item: Attachment) {
    return html`<div role="listitem" class="chip">
      <span class="file-icon"><md-icon>file</md-icon></span>
      <span class="file-text">
        <span>${item.file.name}</span>
        <span>${this.fileKind(item.file)}</span>
      </span>
      <md-icon-button
        aria-label="移除 ${item.file.name}"
        @click=${() => this.removeAttachment(item)}
      >
        <md-icon>close</md-icon>
      </md-icon-button>
    </div>`;
  }

  private fileKind(file: File) {
    const extension = file.name.includes('.')
      ? file.name.split('.').pop()
      : '';
    return extension || file.type || 'file';
  }

  private onInput(event: Event) {
    const field = event.target as HTMLTextAreaElement;
    if (this.thinking) {
      field.value = this.value;
      return;
    }
    this.value = field.value;
  }

  private toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  private openPicker() {
    this.menuOpen = false;
    this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]')?.click();
  }

  private onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    input.value = '';
    if (!selected.length) {
      return;
    }
    this.attachments = [
      ...this.attachments,
      ...selected.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    ];
    this.emitFiles();
  }

  private removeAttachment(item: Attachment) {
    URL.revokeObjectURL(item.url);
    this.attachments = this.attachments.filter((current) => current !== item);
    this.emitFiles();
  }

  private emitFiles() {
    this.dispatchEvent(
      new CustomEvent('files-change', {
        detail: {files: this.files},
        bubbles: true,
        composed: true,
      }),
    );
  }

  private clearText() {
    if (this.thinking) {
      return;
    }
    this.value = '';
  }

  private toggleListening() {
    this.listening = !this.listening;
  }

  private onSend() {
    if (this.thinking) {
      this.thinking = false;
      this.dispatchEvent(
        new CustomEvent('interrupt', {bubbles: true, composed: true}),
      );
      return;
    }
    if (this.listening || !this.hasText) {
      return;
    }
    this.thinking = true;
    this.dispatchEvent(
      new CustomEvent('send', {
        detail: {value: this.value, files: this.files},
        bubbles: true,
        composed: true,
      }),
    );
  }
}

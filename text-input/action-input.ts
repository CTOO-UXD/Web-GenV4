/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../icon/icon.js';
import '../iconbutton/icon-button.js';

import {styles as actionStyles} from './internal/action-input-styles.cssresult.js';
import {TextInput} from './internal/text-input.js';
import {styles as sharedStyles} from './internal/text-input-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-action-input': MdActionInput;
  }
}

/**
 * 带发送按钮的单行输入。框和颜色跟文本输入相同。
 *
 * @en Text input with a send button. The button reuses the text input colors.
 *
 * @fires send {CustomEvent<{value: string}>} 有文字时点击发送。detail.value 是当前文字，文字留在框里。
 * --bubbles --composed
 *
 * @final
 * @suppress {visibility}
 */
@customElement('md-action-input')
export class MdActionInput extends TextInput {
  static override styles: CSSResultOrNative[] = [sharedStyles, actionStyles];

  protected override showsSend = true;
}

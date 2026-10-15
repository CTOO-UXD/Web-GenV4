/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../icon/icon.js';
import '../iconbutton/icon-button.js';

import {styles as textAreaStyles} from './internal/text-area-styles.cssresult.js';
import {TextInput} from './internal/text-input.js';
import {styles as sharedStyles} from './internal/text-input-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-text-area': MdTextArea;
  }
}

/**
 * 多行文本输入。框和颜色跟文本输入相同，超过三行后在框内滚动。
 *
 * @en Multiline text input. Reuses the text input frame and colors.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('md-text-area')
export class MdTextArea extends TextInput {
  static override styles: CSSResultOrNative[] = [sharedStyles, textAreaStyles];

  protected override showsClear = false;
  protected override multiline = true;
}

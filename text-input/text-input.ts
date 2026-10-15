/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../icon/icon.js';
import '../iconbutton/icon-button.js';

import {TextInput} from './internal/text-input.js';
import {styles} from './internal/text-input-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-text-input': MdTextInput;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-text-input')
export class MdTextInput extends TextInput {
  static override styles: CSSResultOrNative[] = [styles];
}

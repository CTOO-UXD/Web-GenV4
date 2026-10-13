/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../button/text-button.js';
import '../icon/icon.js';
import '../iconbutton/filled-icon-button.js';
import '../iconbutton/filled-tonal-icon-button.js';
import '../iconbutton/icon-button.js';

import {AiInput} from './internal/ai-input.js';
import {styles} from './internal/ai-input-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-ai-input': MdAiInput;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-ai-input')
export class MdAiInput extends AiInput {
  static override styles: CSSResultOrNative[] = [styles];
}

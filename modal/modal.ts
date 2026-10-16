/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../button/filled-button.js';
import '../button/outlined-button.js';
import '../button/text-button.js';
import '../checkbox/checkbox.js';
import '../elevation/elevation.js';
import '../icon/icon.js';
import '../iconbutton/icon-button.js';

import {Modal} from './internal/modal.js';
import {styles} from './internal/modal-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-modal': MdModal;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-modal')
export class MdModal extends Modal {
  static override styles: CSSResultOrNative[] = [styles];
}

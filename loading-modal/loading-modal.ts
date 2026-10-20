/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../button/filled-button.js';
import '../elevation/elevation.js';
import '../icon/icon.js';
import '../iconbutton/icon-button.js';
import '../progress/circular-progress.js';

import {LoadingModal} from './internal/loading-modal.js';
import {styles} from './internal/loading-modal-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-loading-modal': MdLoadingModal;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-loading-modal')
export class MdLoadingModal extends LoadingModal {
  static override styles: CSSResultOrNative[] = [styles];
}

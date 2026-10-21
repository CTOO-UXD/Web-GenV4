/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../icon/icon.js';
import '../iconbutton/icon-button.js';

import {AlertBanner} from './internal/alert-banner.js';
import {styles} from './internal/alert-banner-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-alert-banner': MdAlertBanner;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-alert-banner')
export class MdAlertBanner extends AlertBanner {
  static override styles: CSSResultOrNative[] = [styles];
}

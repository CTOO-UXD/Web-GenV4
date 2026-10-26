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
import '../iconbutton/filled-icon-button.js';
import '../iconbutton/icon-button.js';
import '../iconbutton/outlined-icon-button.js';

import {FeatureTourModal} from './internal/feature-tour-modal.js';
import {styles} from './internal/feature-tour-modal-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-feature-tour-modal': MdFeatureTourModal;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-feature-tour-modal')
export class MdFeatureTourModal extends FeatureTourModal {
  static override styles: CSSResultOrNative[] = [styles];
}

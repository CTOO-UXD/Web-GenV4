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

import {HeroModal} from './internal/hero-modal.js';
import {styles} from './internal/hero-modal-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-hero-modal': MdHeroModal;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-hero-modal')
export class MdHeroModal extends HeroModal {
  static override styles: CSSResultOrNative[] = [styles];
}

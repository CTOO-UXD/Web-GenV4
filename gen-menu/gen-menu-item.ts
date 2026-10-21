/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {GenMenuItem} from './internal/gen-menu-item.js';
import {styles} from './internal/gen-menu-item-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-gen-menu-item': MdGenMenuItem;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-gen-menu-item')
export class MdGenMenuItem extends GenMenuItem {
  static override styles: CSSResultOrNative[] = [styles];
}

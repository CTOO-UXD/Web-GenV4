/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {GenMenu} from './internal/gen-menu.js';
import {styles} from './internal/gen-menu-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-gen-menu': MdGenMenu;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-gen-menu')
export class MdGenMenu extends GenMenu {
  static override styles: CSSResultOrNative[] = [styles];
}

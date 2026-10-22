/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../icon/icon.js';
import '../iconbutton/filled-icon-button.js';
import '../iconbutton/filled-tonal-icon-button.js';
import '../iconbutton/icon-button.js';

import {SearchBar} from './internal/search-bar.js';
import {styles} from './internal/search-bar-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-search-bar': MdSearchBar;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-search-bar')
export class MdSearchBar extends SearchBar {
  static override styles: CSSResultOrNative[] = [styles];
}

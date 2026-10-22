/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import {GenMenuGroup} from './internal/gen-menu-group.js';
import {styles} from './internal/gen-menu-group-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-gen-menu-group': MdGenMenuGroup;
  }
}

/**
 * 一张圆角卡。没有属性，颜色跟着菜单的 theme。
 *
 * @en A rounded card with no properties. Color follows the menu theme.
 *
 * @final
 * @suppress {visibility}
 */
@customElement('md-gen-menu-group')
export class MdGenMenuGroup extends GenMenuGroup {
  static override styles: CSSResultOrNative[] = [styles];
}

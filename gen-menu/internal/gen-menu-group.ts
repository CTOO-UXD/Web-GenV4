/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement} from 'lit';

/**
 * 菜单里的一张圆角卡。没有自己的属性，颜色跟着所在菜单的 theme。
 */
export class GenMenuGroup extends LitElement {
  constructor() {
    super();
    this.setAttribute('role', 'group');
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

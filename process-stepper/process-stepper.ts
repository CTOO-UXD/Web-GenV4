/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import './process-step.js';

import {ProcessStepper} from './internal/process-stepper.js';
import {styles} from './internal/process-stepper-styles.cssresult.js';

declare global {
  interface HTMLElementTagNameMap {
    'md-process-stepper': MdProcessStepper;
  }
}

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-process-stepper')
export class MdProcessStepper extends ProcessStepper {
  static override styles: CSSResultOrNative[] = [styles];
}

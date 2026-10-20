/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CSSResultOrNative} from 'lit';
import {customElement} from 'lit/decorators.js';

import '../icon/icon.js';

import {ProcessStep, ProcessStepper} from './internal/process-stepper.js';
import {styles} from './internal/process-stepper-styles.cssresult.js';

export {ProcessStep, ProcessStepper};

declare global {
  interface HTMLElementTagNameMap {
    'md-process-step': MdProcessStep;
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

/**
 * @final
 * @suppress {visibility}
 */
@customElement('md-process-step')
export class MdProcessStep extends ProcessStep {
  static override styles: CSSResultOrNative[] = [styles];
}

/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, LitElement, nothing, PropertyValues} from 'lit';
import {property, state} from 'lit/decorators.js';

type Orientation = 'horizontal' | 'vertical';
type Marker = 'number' | 'icon' | 'empty';
type StepState = 'complete' | 'in-progress' | 'enabled' | 'disabled';
type Trail = 'none' | 'completed' | 'active' | 'muted';

/**
 * 一条流程的方向、圆点类型和标签。每一步的状态由页面写在子级上。
 *
 * @en Direction, marker and labels for a flow. Each step's state is set by the page.
 */
export class ProcessStepper extends LitElement {
  /**
   * 方向。取值 horizontal、vertical。
   * @en Flow direction.
   */
  @property({reflect: true}) orientation: Orientation = 'horizontal';

  /**
   * 圆点里画什么。取值 number、icon、empty。一条流程只用一种。
   * @en What to draw inside each circle. One type for the whole flow.
   */
  @property({reflect: true}) type: Marker = 'number';

  /**
   * 是否显示每一步的标签。默认开。
   * @en Whether each step shows its label.
   */
  @property({type: Boolean, reflect: true, attribute: 'show-labels'})
  showLabels = true;

  override updated(changed: PropertyValues) {
    if (
      changed.has('orientation') ||
      changed.has('type') ||
      changed.has('showLabels')
    ) {
      this.requestSteps();
    }
  }

  private requestSteps() {
    for (const step of this.steps) {
      step.requestUpdate();
    }
  }

  private get steps() {
    return [...this.querySelectorAll(':scope > md-process-step')] as ProcessStep[];
  }

  private handleSlotChange() {
    this.requestSteps();
  }

  protected override render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }
}

/**
 * 流程中的一步。标签放在默认插槽。
 *
 * @en One step in a flow. The label is the default slot.
 */
export class ProcessStep extends LitElement {
  /**
   * 这一步的状态。取值 complete、in-progress、enabled、disabled。默认 enabled。
   * @en Visual state of this step.
   */
  @property({reflect: true}) state: StepState = 'enabled';

  /**
   * 图标连字。只在父级 type 为 icon、且这一步不是完成时使用。不写就画空圈。
   * @en Icon ligature. Used when the flow type is icon and this step is not complete.
   */
  @property() icon = '';

  @state() private stepNumber = 1;
  @state() private labelsOn = true;
  @state() private markerKind: Marker = 'number';
  @state() private trail: Trail = 'none';
  private seenState: StepState = 'enabled';

  override willUpdate() {
    const parent = this.closest('md-process-stepper') as ProcessStepper | null;
    if (!parent) {
      this.stepNumber = 1;
      this.labelsOn = true;
      this.markerKind = 'number';
      this.trail = 'none';
      this.setAttribute('orientation', 'horizontal');
      this.toggleAttribute('data-last', true);
      return;
    }

    const steps = [...parent.querySelectorAll(':scope > md-process-step')] as ProcessStep[];
    const index = Math.max(0, steps.indexOf(this));
    const next = steps[index + 1];
    this.stepNumber = index + 1;
    this.labelsOn = parent.showLabels;
    this.markerKind = parent.type;
    this.setAttribute('orientation', parent.orientation);
    this.toggleAttribute('data-last', !next);
    this.trail = trailBetween(this.state, next?.state);
  }

  override updated() {
    if (this.state === this.seenState) {
      return;
    }

    this.seenState = this.state;
    const parent = this.closest('md-process-stepper');
    if (!parent) {
      return;
    }

    const steps = [...parent.querySelectorAll(':scope > md-process-step')] as ProcessStep[];
    steps[steps.indexOf(this) - 1]?.requestUpdate();
  }

  private get marker() {
    if (this.state === 'complete') {
      return html`<md-icon>check</md-icon>`;
    }

    if (this.markerKind === 'number') {
      return html`<span class="number">${this.stepNumber}</span>`;
    }

    if (this.markerKind === 'icon' && this.icon) {
      return html`<md-icon>${this.icon}</md-icon>`;
    }

    return nothing;
  }

  protected override render() {
    const trail =
      this.trail === 'none'
        ? nothing
        : html`<div class="trail ${this.trail}"></div>`;
    return html`
      <div class="track">
        <div class="circle">${this.marker}</div>
        ${trail}
      </div>
      <div class="label" ?hidden=${!this.labelsOn}><slot></slot></div>
    `;
  }
}

function trailBetween(state: StepState, next?: StepState): Trail {
  if (!next) {
    return 'none';
  }

  if (state === 'disabled' && next === 'disabled') {
    return 'muted';
  }

  if (state === 'complete') {
    return 'completed';
  }

  return 'active';
}

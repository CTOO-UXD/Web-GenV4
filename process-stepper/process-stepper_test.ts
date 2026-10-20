/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdProcessStep, MdProcessStepper} from './process-stepper.js';

describe('<md-process-stepper>', () => {
  const env = new Environment();

  async function setup(template = html`
    <md-process-stepper>
      <md-process-step>账户</md-process-step>
      <md-process-step state="in-progress">资料</md-process-step>
      <md-process-step state="disabled">审核</md-process-step>
    </md-process-stepper>
  `) {
    const root = env.render(template);
    const stepper = root.querySelector<MdProcessStepper>('md-process-stepper')!;
    await env.waitForStability();
    await stepper.updateComplete;
    const steps = [...stepper.querySelectorAll('md-process-step')];
    await Promise.all(steps.map((step) => step.updateComplete));
    return {stepper, steps};
  }

  function circle(step: MdProcessStep) {
    return step.shadowRoot!.querySelector<HTMLElement>('.circle')!;
  }

  function trail(step: MdProcessStep) {
    return step.shadowRoot!.querySelector<HTMLElement>('.trail');
  }

  describe('tokens', () => {
    createTokenTests(MdProcessStepper.styles);
  });

  it('defaults to a horizontal numbered flow with labels', async () => {
    const {stepper, steps} = await setup();

    expect(stepper.orientation).toBe('horizontal');
    expect(stepper.type).toBe('number');
    expect(stepper.showLabels).toBeTrue();
    expect(steps[0].state).toBe('enabled');
  });

  it('numbers every step, including a disabled one', async () => {
    const {steps} = await setup();

    expect(circle(steps[0]).textContent).toContain('1');
    expect(circle(steps[1]).textContent).toContain('2');
    expect(circle(steps[2]).textContent).toContain('3');
  });

  it('draws two in-progress steps without changing either', async () => {
    const {steps} = await setup(html`
      <md-process-stepper>
        <md-process-step state="in-progress">一</md-process-step>
        <md-process-step state="in-progress">二</md-process-step>
      </md-process-stepper>
    `);

    expect(steps.map((step) => step.state)).toEqual([
      'in-progress',
      'in-progress',
    ]);
    expect(circle(steps[0]).textContent).toContain('1');
    expect(circle(steps[1]).textContent).toContain('2');
  });

  it('uses a check for every completed marker', async () => {
    const {steps} = await setup(html`
      <md-process-stepper type="empty">
        <md-process-step state="complete">完成</md-process-step>
        <md-process-step>下一步</md-process-step>
      </md-process-stepper>
    `);

    expect(circle(steps[0]).textContent).toContain('check');
    expect(circle(steps[1]).textContent?.trim()).toBe('');
  });

  it('draws an empty in-progress circle with no marker', async () => {
    const {steps} = await setup(html`
      <md-process-stepper type="empty">
        <md-process-step state="in-progress">进行中</md-process-step>
      </md-process-stepper>
    `);

    expect(circle(steps[0]).textContent?.trim()).toBe('');
    expect(getComputedStyle(circle(steps[0])).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
  });

  it('draws an icon, and an empty circle when the ligature is missing', async () => {
    const {steps} = await setup(html`
      <md-process-stepper type="icon">
        <md-process-step icon="mail">邮件</md-process-step>
        <md-process-step>空</md-process-step>
        <md-process-step icon="mail" state="complete">完成</md-process-step>
      </md-process-stepper>
    `);

    expect(circle(steps[0]).textContent).toContain('mail');
    expect(circle(steps[1]).textContent?.trim()).toBe('');
    expect(circle(steps[2]).textContent).toContain('check');
  });

  it('leaves the last step without a trail', async () => {
    const {steps} = await setup();

    expect(trail(steps[2])).toBeNull();
  });

  it('draws a muted trail only between two disabled steps', async () => {
    const {steps} = await setup(html`
      <md-process-stepper>
        <md-process-step state="enabled">一</md-process-step>
        <md-process-step state="disabled">二</md-process-step>
        <md-process-step state="disabled">三</md-process-step>
        <md-process-step state="enabled">四</md-process-step>
      </md-process-stepper>
    `);

    expect(trail(steps[0])!.classList.contains('active')).toBeTrue();
    expect(trail(steps[1])!.classList.contains('muted')).toBeTrue();
    expect(trail(steps[2])!.classList.contains('active')).toBeTrue();
    expect(trail(steps[3])).toBeNull();
  });

  it('draws a thick trail after a completed step', async () => {
    const {steps} = await setup(html`
      <md-process-stepper>
        <md-process-step state="complete">一</md-process-step>
        <md-process-step state="in-progress">二</md-process-step>
      </md-process-stepper>
    `);

    expect(trail(steps[0])!.classList.contains('completed')).toBeTrue();
    expect(trail(steps[1])).toBeNull();
  });

  it('updates the previous trail when the next step becomes disabled', async () => {
    const {steps} = await setup(html`
      <md-process-stepper>
        <md-process-step state="disabled">一</md-process-step>
        <md-process-step state="enabled">二</md-process-step>
      </md-process-stepper>
    `);

    expect(trail(steps[0])!.classList.contains('active')).toBeTrue();
    steps[1].state = 'disabled';
    await steps[1].updateComplete;
    await steps[0].updateComplete;

    expect(trail(steps[0])!.classList.contains('muted')).toBeTrue();
  });

  it('hides labels without removing the circle', async () => {
    const {stepper, steps} = await setup();
    const withLabel = steps[0].getBoundingClientRect().height;
    stepper.showLabels = false;
    await stepper.updateComplete;
    await Promise.all(steps.map((step) => step.updateComplete));

    const label = steps[0].shadowRoot!.querySelector<HTMLElement>('.label')!;
    expect(label.hasAttribute('hidden')).toBeTrue();
    expect(label.getBoundingClientRect().height).toBe(0);
    expect(steps[0].getBoundingClientRect().height).toBeLessThan(withLabel);
    expect(circle(steps[0]).textContent).toContain('1');
  });

  it('places a vertical trail under the circle', async () => {
    const {stepper, steps} = await setup(html`
      <md-process-stepper orientation="vertical">
        <md-process-step state="complete">一</md-process-step>
        <md-process-step>二</md-process-step>
      </md-process-stepper>
    `);

    expect(stepper.orientation).toBe('vertical');
    expect(steps[0].getAttribute('orientation')).toBe('vertical');
    const line = trail(steps[0])!;
    const dot = circle(steps[0]);
    expect(line.offsetTop).toBeGreaterThanOrEqual(dot.offsetTop + dot.offsetHeight - 1);
    expect(getComputedStyle(line).paddingTop).toBe('4px');
    expect(getComputedStyle(line).paddingBottom).toBe('4px');
    expect(trail(steps[1])).toBeNull();
  });

  it('splits extra width and height across the trails', async () => {
    const wide = await setup(html`
      <md-process-stepper style="width: 600px">
        <md-process-step>一</md-process-step>
        <md-process-step>二</md-process-step>
      </md-process-stepper>
    `);
    expect(trail(wide.steps[0])!.getBoundingClientRect().width).toBeGreaterThan(32);

    const tall = await setup(html`
      <md-process-stepper orientation="vertical" style="height: 240px">
        <md-process-step>一</md-process-step>
        <md-process-step>二</md-process-step>
        <md-process-step>三</md-process-step>
      </md-process-stepper>
    `);
    const first = trail(tall.steps[0])!.getBoundingClientRect().height;
    const second = trail(tall.steps[1])!.getBoundingClientRect().height;
    expect(first).toBeGreaterThan(40);
    expect(Math.abs(first - second)).toBeLessThan(2);
    expect(tall.stepper.getBoundingClientRect().height).toBeCloseTo(240, 0);
  });

  it('sizes the circle, trails, and step from the spec', async () => {
    const {steps} = await setup(html`
      <md-process-stepper>
        <md-process-step state="complete">一</md-process-step>
        <md-process-step state="disabled">二</md-process-step>
        <md-process-step state="disabled">三</md-process-step>
      </md-process-stepper>
    `);
    const dot = circle(steps[0]);
    const completed = getComputedStyle(trail(steps[0])!);
    const completedLine = getComputedStyle(trail(steps[0])!, '::before');
    const mutedLine = getComputedStyle(trail(steps[1])!, '::before');
    const step = getComputedStyle(steps[0]);

    expect(getComputedStyle(dot).width).toBe('24px');
    expect(getComputedStyle(dot).borderTopWidth).toBe('2px');
    expect(completedLine.height).toBe('3px');
    expect(parseFloat(completed.minWidth)).toBe(32);
    expect(completed.paddingLeft).toBe('4px');
    expect(completed.paddingRight).toBe('4px');
    expect(mutedLine.height).toBe('2px');
    expect(parseFloat(step.minWidth)).toBe(88);
    expect(completedLine.backgroundColor).not.toBe(mutedLine.backgroundColor);
  });

  it('uses the marker size and the gaps from the spec', async () => {
    const horizontal = await setup(html`
      <md-process-stepper type="icon">
        <md-process-step icon="mail">邮件</md-process-step>
        <md-process-step>下一步</md-process-step>
      </md-process-stepper>
    `);
    const icon = circle(horizontal.steps[0]).querySelector('md-icon')!;
    const dot = circle(horizontal.steps[0]).getBoundingClientRect();
    const label = horizontal.steps[0]
      .shadowRoot!.querySelector('.label')!
      .getBoundingClientRect();
    expect(icon.getBoundingClientRect().width).toBe(16);
    expect(Math.round(label.top - dot.bottom)).toBe(8);

    const vertical = await setup(html`
      <md-process-stepper orientation="vertical" type="icon">
        <md-process-step icon="mail">邮件</md-process-step>
        <md-process-step>下一步</md-process-step>
      </md-process-stepper>
    `);
    const verticalDot = circle(vertical.steps[0]).getBoundingClientRect();
    const verticalLabel = vertical.steps[0]
      .shadowRoot!.querySelector('.label')!
      .getBoundingClientRect();
    expect(Math.round(verticalLabel.left - verticalDot.right)).toBe(8);
  });

  it('paints circles and trails with the system color roles', async () => {
    const {stepper, steps} = await setup(html`
      <md-process-stepper>
        <md-process-step state="complete">一</md-process-step>
        <md-process-step state="disabled">二</md-process-step>
        <md-process-step state="disabled">三</md-process-step>
      </md-process-stepper>
    `);
    stepper.style.setProperty('--md-sys-color-primary', 'rgb(1, 2, 3)');
    stepper.style.setProperty('--md-sys-color-on-primary', 'rgb(4, 5, 6)');
    stepper.style.setProperty('--md-sys-color-outline', 'rgb(7, 8, 9)');
    stepper.style.setProperty(
      '--md-sys-color-on-surface-variant',
      'rgb(10, 11, 12)',
    );

    const done = getComputedStyle(circle(steps[0]));
    const disabled = getComputedStyle(circle(steps[1]));
    const disabledLabel = getComputedStyle(
      steps[1].shadowRoot!.querySelector('.label')!,
    );
    const completedLine = getComputedStyle(trail(steps[0])!, '::before');
    const mutedLine = getComputedStyle(trail(steps[1])!, '::before');

    expect(done.backgroundColor).toBe('rgb(1, 2, 3)');
    expect(done.color).toBe('rgb(4, 5, 6)');
    expect(completedLine.backgroundColor).toBe('rgb(1, 2, 3)');
    expect(disabled.borderTopColor).toBe('rgb(7, 8, 9)');
    expect(disabled.color).toBe('rgb(10, 11, 12)');
    expect(disabledLabel.color).toBe('rgb(10, 11, 12)');
    expect(mutedLine.backgroundColor).toBe('rgb(7, 8, 9)');
  });
});

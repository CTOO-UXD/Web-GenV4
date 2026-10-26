/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdSearchBar} from './search-bar.js';

function button(root: ParentNode, label: string) {
  return [...root.querySelectorAll<HTMLElement>(
    'md-icon-button, md-filled-icon-button, md-filled-tonal-icon-button',
  )].find((item) => item.getAttribute('aria-label') === label);
}

function buttonFace(buttonEl: Element) {
  return getComputedStyle(buttonEl.shadowRoot!.querySelector('.icon-button')!, '::before');
}

describe('<md-search-bar>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(MdSearchBar.styles);
  });

  async function render(template = html`<md-search-bar></md-search-bar>`) {
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector('md-search-bar')!;
  }

  it('starts empty, closed, and without a placeholder', async () => {
    const bar = await render();
    const field = bar.renderRoot.querySelector('input')!;

    expect(bar.value).toBe('');
    expect(field.placeholder).toBe('');
    expect(bar.hasAttribute('open')).toBeFalse();
    expect(bar.renderRoot.querySelector('.results')).toBeNull();
    expect(button(bar.renderRoot, '麦克风')).not.toBeUndefined();
    expect(button(bar.renderRoot, '清除')).toBeUndefined();
    expect(button(bar.renderRoot, '提交')!.tagName).toBe('MD-ICON-BUTTON');
    expect(button(bar.renderRoot, '提交')!.hasAttribute('disabled')).toBeTrue();
  });

  it('treats spaces as empty and ignores the idle arrow', async () => {
    const bar = await render();
    const submits: Event[] = [];
    bar.addEventListener('submit', (event) => submits.push(event));
    bar.value = '   ';
    await bar.updateComplete;

    expect(button(bar.renderRoot, '麦克风')).not.toBeUndefined();
    button(bar.renderRoot, '提交')!.click();
    bar.renderRoot.querySelector('input')!.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}),
    );

    expect(submits).toEqual([]);
    expect(bar.value).toBe('   ');
  });

  it('shows clear and a filled arrow when there is text', async () => {
    const bar = await render();
    const field = bar.renderRoot.querySelector('input')!;
    field.value = 'hello';
    field.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    await bar.updateComplete;

    expect(bar.value).toBe('hello');
    expect(button(bar.renderRoot, '清除')!.tagName).toBe(
      'MD-FILLED-TONAL-ICON-BUTTON',
    );
    expect(button(bar.renderRoot, '提交')!.tagName).toBe('MD-FILLED-ICON-BUTTON');
    expect(button(bar.renderRoot, '麦克风')).toBeUndefined();
  });

  it('submits on enter and on the filled arrow without closing results', async () => {
    const bar = await render(html`<md-search-bar open value="ink"></md-search-bar>`);
    const submits: Array<CustomEvent<{value: string}>> = [];
    bar.addEventListener('submit', (event) => {
      submits.push(event as unknown as CustomEvent<{value: string}>);
    });

    bar.renderRoot.querySelector('input')!.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}),
    );
    button(bar.renderRoot, '提交')!.click();

    expect(submits.map((event) => event.detail.value)).toEqual(['ink', 'ink']);
    expect(bar.value).toBe('ink');
    expect(bar.open).toBeTrue();
  });

  it('clears text, keeps focus, and emits input', async () => {
    const bar = await render(html`<md-search-bar open value="ink"></md-search-bar>`);
    const events: string[] = [];
    bar.addEventListener('input', () => events.push('input'));
    bar.addEventListener('clear', () => events.push('clear'));

    button(bar.renderRoot, '清除')!.click();
    await bar.updateComplete;

    expect(bar.value).toBe('');
    expect(bar.open).toBeTrue();
    expect(bar.shadowRoot!.activeElement).toBe(bar.renderRoot.querySelector('input'));
    expect(events).toEqual(['input']);
    expect(button(bar.renderRoot, '麦克风')).not.toBeUndefined();
  });

  it('emits mic without changing the button', async () => {
    const bar = await render();
    const events: Event[] = [];
    bar.addEventListener('mic', (event) => events.push(event));
    const mic = button(bar.renderRoot, '麦克风')!;

    mic.click();

    expect(events.length).toBe(1);
    expect(button(bar.renderRoot, '麦克风')).toBe(mic);
  });

  it('keeps an empty results container when open and hides it when closed', async () => {
    const bar = await render(html`<md-search-bar open></md-search-bar>`);
    const results = bar.renderRoot.querySelector('.results')!;

    expect(results).not.toBeNull();
    expect(results.getBoundingClientRect().height).toBe(4);

    bar.open = false;
    await bar.updateComplete;

    expect(bar.renderRoot.querySelector('.results')).toBeNull();
    expect(bar.renderRoot.querySelector('.capsule')!.getBoundingClientRect().height).toBeGreaterThan(0);
  });

  it('scrolls results past the max height without clipping the capsule', async () => {
    const root = env.render(html`
      <md-search-bar open style="width: 640px; --md-search-bar-results-max-height: 80px">
        <div slot="results" style="height: 240px"></div>
      </md-search-bar>
    `);
    await env.waitForStability();
    const bar = root.querySelector('md-search-bar')!;
    const capsule = bar.renderRoot.querySelector('.capsule')!;
    const items = bar.renderRoot.querySelector('.items')! as HTMLElement;
    const field = bar.renderRoot.querySelector('.field')!;

    expect(items.clientHeight).toBeLessThanOrEqual(80);
    expect(items.scrollHeight).toBeGreaterThan(items.clientHeight);
    expect(bar.renderRoot.querySelector('.scrollbar')!.hasAttribute('hidden')).toBeFalse();
    expect(capsule.getBoundingClientRect().height).toBeGreaterThan(
      field.getBoundingClientRect().height,
    );
    expect(getComputedStyle(capsule).overflow).not.toBe('hidden');
  });

  it('does not push the next sibling when narrow results open', async () => {
    const root = env.render(html`
      <div>
        <md-search-bar id="bar" style="width: 400px"></md-search-bar>
        <div id="after">after</div>
      </div>
    `);
    await env.waitForStability();
    const bar = root.querySelector('md-search-bar')!;
    const after = root.querySelector('#after')! as HTMLElement;
    const before = after.getBoundingClientRect().top;

    bar.open = true;
    await bar.updateComplete;

    expect(after.getBoundingClientRect().top).toBe(before);
    const capsule = bar.renderRoot.querySelector('.capsule')!;
    const results = bar.renderRoot.querySelector('.results')!;
    expect(results.getBoundingClientRect().top - capsule.getBoundingClientRect().bottom).toBeCloseTo(8, 0);
    expect(results.getBoundingClientRect().width).toBeCloseTo(
      capsule.getBoundingClientRect().width,
      0,
    );
  });

  it('uses the wide sizes at 560px and the narrow sizes below', async () => {
    const bar = await render(html`<md-search-bar style="width: 560px"></md-search-bar>`);
    const capsule = bar.renderRoot.querySelector('.capsule')!;
    const field = bar.renderRoot.querySelector('.field')!;
    const row = bar.renderRoot.querySelector('.bar-row')!;
    const leading = bar.renderRoot.querySelector('.leading')!;
    const icon = leading.querySelector('md-icon')!;

    expect(capsule.getBoundingClientRect().height).toBe(64);
    expect(getComputedStyle(capsule).borderRadius).toBe('32px');
    expect(getComputedStyle(capsule).paddingTop).toBe('8px');
    expect(getComputedStyle(row).columnGap).toBe('12px');
    expect(field.getBoundingClientRect().height).toBe(48);
    expect(getComputedStyle(field).borderRadius).toBe('24px');
    expect(getComputedStyle(field).columnGap).toBe('4px');
    expect(leading.getBoundingClientRect().width).toBe(48);
    expect(icon.getBoundingClientRect().width).toBe(24);
    expect(button(bar.renderRoot, '麦克风')!.querySelector('md-icon')!.getBoundingClientRect().width).toBe(24);
    expect(button(bar.renderRoot, '提交')!.querySelector('md-icon')!.getBoundingClientRect().width).toBe(24);
    expect(getComputedStyle(field).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(button(bar.renderRoot, '提交')!).backgroundColor).toBe(
      'rgb(255, 255, 255)',
    );
    expect(button(bar.renderRoot, '麦克风')!.getBoundingClientRect().width).toBe(40);
    expect(
      field.getBoundingClientRect().right -
        button(bar.renderRoot, '麦克风')!.getBoundingClientRect().right,
    ).toBeCloseTo(4, 0);
    expect(button(bar.renderRoot, '提交')!.getBoundingClientRect().width).toBe(48);

    bar.style.width = '559px';
    await bar.updateComplete;

    expect(capsule.getBoundingClientRect().height).toBe(56);
    expect(getComputedStyle(capsule).paddingTop).toBe('4px');
    expect(getComputedStyle(capsule).borderRadius).toBe('32px');
    expect(getComputedStyle(row).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(field).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(button(bar.renderRoot, '提交')!.querySelector('md-icon')!.getBoundingClientRect().width).toBe(24);
    const submit = button(bar.renderRoot, '提交')!;
    expect(submit.getBoundingClientRect().width).toBe(40);
    expect(row.getBoundingClientRect().right - submit.getBoundingClientRect().right).toBeCloseTo(
      4,
      0,
    );
  });

  it('keeps the field radius and pads the results while wide results are open', async () => {
    const bar = await render(html`
      <md-search-bar open style="width: 640px"></md-search-bar>
    `);
    const field = bar.renderRoot.querySelector('.field')!;
    const results = bar.renderRoot.querySelector('.results')!;

    expect(getComputedStyle(field).borderRadius).toBe('24px');
    expect(getComputedStyle(results).borderRadius).toBe('16px');
    expect(getComputedStyle(results).paddingTop).toBe('2px');
    expect(getComputedStyle(results).paddingBottom).toBe('2px');
    expect(getComputedStyle(bar.renderRoot.querySelector('.capsule')!).rowGap).toBe('4px');
  });

  it('paints the capsule, text, caret, clear disc, and submit button', async () => {
    const bar = await render(html`
      <md-search-bar value="ink" style="width: 640px"></md-search-bar>
    `);
    const capsule = getComputedStyle(bar.renderRoot.querySelector('.capsule')!);
    const field = bar.renderRoot.querySelector('input')!;
    const clear = button(bar.renderRoot, '清除')!;
    const submit = button(bar.renderRoot, '提交')!;

    expect(capsule.backgroundColor).toContain('0.8');
    expect(capsule.boxShadow).toContain('10px');
    expect(capsule.boxShadow).toContain('0.12');
    expect(getComputedStyle(field).color).toBe('rgb(28, 27, 27)');
    expect(getComputedStyle(field).caretColor).toBe('rgb(108, 67, 198)');
    expect(getComputedStyle(field, '::placeholder').color).toBe('rgb(73, 69, 78)');
    expect(buttonFace(clear).backgroundColor).toBe('rgb(231, 226, 221)');
    expect(getComputedStyle(clear.shadowRoot!.querySelector('.icon-button')!).color).toBe(
      'rgb(28, 27, 27)',
    );
    expect(buttonFace(submit).backgroundColor).toBe('rgb(108, 67, 198)');
    expect(getComputedStyle(submit.shadowRoot!.querySelector('.icon-button')!).color).toBe(
      'rgb(255, 255, 255)',
    );
    expect(capsule.borderTopWidth).toBe('0px');
  });

  it('gives the narrow results card an opaque surface and two shadows', async () => {
    const bar = await render(html`
      <md-search-bar open style="width: 400px"></md-search-bar>
    `);
    const results = getComputedStyle(bar.renderRoot.querySelector('.results')!);

    expect(results.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(results.boxShadow).toContain('6px');
    expect(results.boxShadow).toContain('0.12');
    expect(results.boxShadow).toContain('0.3');
    expect(results.borderRadius).toBe('16px');
  });
});

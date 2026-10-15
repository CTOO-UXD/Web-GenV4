/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdTextArea} from './text-area.js';

describe('<md-text-area>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(MdTextArea.styles);
  });

  async function render(template = html`<md-text-area label="Label"></md-text-area>`) {
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector('md-text-area')!;
  }

  function fieldOf(input: MdTextArea) {
    return input.renderRoot.querySelector<HTMLElement>('.field')!;
  }

  function labelOf(input: MdTextArea) {
    return input.renderRoot.querySelector<HTMLElement>('.label')!;
  }

  function areaOf(input: MdTextArea) {
    return input.renderRoot.querySelector('textarea')!;
  }

  async function setValue(input: MdTextArea, value: string) {
    input.value = value;
    await input.updateComplete;
  }

  it('keeps an empty field at 96px with the large label at the top', async () => {
    const input = await render();
    const field = fieldOf(input);
    const label = labelOf(input);

    expect(getComputedStyle(field).height).toBe('96px');
    expect(getComputedStyle(label).fontSize).toBe('16px');
    expect(label.getBoundingClientRect().top - field.getBoundingClientRect().top).toBeLessThan(
      20,
    );
    expect(input.renderRoot.querySelector('.clear')).toBeNull();
  });

  it('shrinks the label when focused, even if empty', async () => {
    const input = await render();
    areaOf(input).focus();

    expect(getComputedStyle(labelOf(input)).fontSize).toBe('12px');
    expect(input.renderRoot.querySelector('.clear')).toBeNull();
  });

  it('shrinks the label when there is a placeholder or a value', async () => {
    const input = await render(html`
      <md-text-area label="Label" placeholder="Placeholder text"></md-text-area>
    `);

    expect(getComputedStyle(labelOf(input)).fontSize).toBe('12px');
    expect(getComputedStyle(fieldOf(input)).height).toBe('96px');

    await setValue(input, 'a');
    expect(getComputedStyle(labelOf(input)).fontSize).toBe('12px');
    expect(getComputedStyle(fieldOf(input)).height).toBe('96px');
  });

  it('stays at 96px for two lines and grows to 112px at three', async () => {
    const input = await render();

    await setValue(input, 'a\nb');
    expect(getComputedStyle(fieldOf(input)).height).toBe('96px');
    expect(areaOf(input).scrollHeight).toBeLessThanOrEqual(areaOf(input).clientHeight + 1);

    await setValue(input, 'a\nb\nc');
    expect(getComputedStyle(fieldOf(input)).height).toBe('112px');
    expect(areaOf(input).scrollHeight).toBeLessThanOrEqual(areaOf(input).clientHeight + 1);
  });

  it('scrolls inside the text after three lines and keeps the label put', async () => {
    const input = await render();
    await setValue(input, 'a\nb\nc\nd');
    const field = fieldOf(input);
    const area = areaOf(input);
    const label = labelOf(input);

    expect(getComputedStyle(field).height).toBe('112px');
    expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
    expect(label.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      field.getBoundingClientRect().top,
    );
    expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      area.getBoundingClientRect().top + 1,
    );
  });

  it('writes a newline into the value and does not emit send', async () => {
    const input = await render();
    let sent = false;
    input.addEventListener('send', () => {
      sent = true;
    });
    const area = areaOf(input);
    area.focus();
    area.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    area.value = 'a\nb';
    area.dispatchEvent(new Event('input', {bubbles: true}));
    await input.updateComplete;

    expect(sent).toBeFalse();
    expect(input.value).toBe('a\nb');
  });

  it('keeps supporting text and error text', async () => {
    const input = await render(html`
      <md-text-area label="Label" supporting-text="Helper text"></md-text-area>
    `);
    const support = () => input.renderRoot.querySelector('.supporting')!;

    expect(support().textContent).toContain('Helper text');

    input.error = true;
    input.errorText = 'Error text';
    await input.updateComplete;
    expect(support().textContent).toContain('Error text');
    expect(support().querySelector('md-icon')!.textContent).toBe('error');

    areaOf(input).focus();
    expect(getComputedStyle(fieldOf(input)).boxShadow).toContain('rgb(186, 26, 26)');
  });

  it('passes maxlength through and shows no character count', async () => {
    const input = await render(html`<md-text-area label="Label"></md-text-area>`);
    expect(areaOf(input).hasAttribute('maxlength')).toBeFalse();

    input.maxLength = 3;
    await input.updateComplete;
    expect(areaOf(input).maxLength).toBe(3);
    expect(input.renderRoot.textContent).not.toContain('0/');
  });
});

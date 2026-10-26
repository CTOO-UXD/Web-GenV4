/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdActionInput} from './action-input.js';
import {sendMouse} from './send-mouse.js';

describe('<md-action-input>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(MdActionInput.styles);
  });

  async function render(template = html`<md-action-input label="Label"></md-action-input>`) {
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector('md-action-input')!;
  }

  function sendOf(input: MdActionInput) {
    return input.renderRoot.querySelector<HTMLElement>('.send')!;
  }

  function iconColor(input: MdActionInput) {
    const face = sendOf(input).shadowRoot!.querySelector('.icon-button')!;
    return getComputedStyle(face).color;
  }

  it('disables send and uses the disabled color when empty', async () => {
    const input = await render();
    let sent = false;
    input.addEventListener('send', () => {
      sent = true;
    });

    expect(getComputedStyle(sendOf(input)).pointerEvents).toBe('none');
    expect(iconColor(input)).toBe('rgba(0, 0, 0, 0.38)');
    sendOf(input).click();
    expect(sent).toBeFalse();
  });

  it('uses the clear icon color when there is text', async () => {
    const input = await render(html`<md-action-input label="Label" value="hello"></md-action-input>`);

    expect(iconColor(input)).toBe('rgb(95, 94, 96)');
  });

  it('turns the icon primary on hover but still blocks an empty send', async () => {
    const input = await render();
    let sent = false;
    input.addEventListener('send', () => {
      sent = true;
    });
    const box = input.getBoundingClientRect();
    await sendMouse({
      type: 'move',
      position: [
        Math.round(box.x + box.width / 2),
        Math.round(box.y + box.height / 2),
      ],
    });

    expect(iconColor(input)).toBe('rgb(108, 67, 198)');
    expect(getComputedStyle(sendOf(input)).pointerEvents).toBe('none');
    sendOf(input).click();
    expect(sent).toBeFalse();
  });

  it('turns the icon primary on focus but still blocks an empty send', async () => {
    const input = await render();
    let sent = false;
    input.addEventListener('send', () => {
      sent = true;
    });
    input.renderRoot.querySelector('input')!.focus();
    await input.updateComplete;

    expect(iconColor(input)).toBe('rgb(108, 67, 198)');
    sendOf(input).click();
    expect(sent).toBeFalse();
  });

  it('turns the icon error-colored when invalid', async () => {
    const input = await render(html`<md-action-input label="Label" error></md-action-input>`);

    expect(iconColor(input)).toBe('rgb(186, 26, 26)');
  });

  it('sends the current value without clearing it or changing the icon', async () => {
    const input = await render(html`<md-action-input label="Label" value="hello"></md-action-input>`);
    const detail: string[] = [];
    input.addEventListener('send', ((event: CustomEvent<{value: string}>) => {
      detail.push(event.detail.value);
    }) as EventListener);
    const color = iconColor(input);

    sendOf(input).click();
    await input.updateComplete;

    expect(detail).toEqual(['hello']);
    expect(input.value).toBe('hello');
    expect(iconColor(input)).toBe(color);
  });

  it('places clear before send while focused', async () => {
    const input = await render(html`<md-action-input label="Label" value="hello"></md-action-input>`);
    input.renderRoot.querySelector('input')!.focus();
    await input.updateComplete;
    const buttons = [...input.renderRoot.querySelectorAll('md-icon-button')];

    expect(buttons.map((button) => button.className)).toEqual(['clear', 'send']);
  });

  it('still sends when read-only and there is text', async () => {
    const input = await render(html`
      <md-action-input label="Label" value="hello" readonly></md-action-input>
    `);
    const detail: string[] = [];
    input.addEventListener('send', ((event: CustomEvent<{value: string}>) => {
      detail.push(event.detail.value);
    }) as EventListener);

    expect(input.renderRoot.querySelector('.clear')).toBeNull();
    sendOf(input).click();
    expect(detail).toEqual(['hello']);
  });

  it('sends on Enter and skips whitespace', async () => {
    const input = await render(html`<md-action-input label="Label" value="hello"></md-action-input>`);
    const values: string[] = [];
    input.addEventListener('send', ((event: CustomEvent<{value: string}>) => {
      values.push(event.detail.value);
    }) as EventListener);
    const field = input.renderRoot.querySelector('input')!;
    field.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    input.value = '   ';
    await input.updateComplete;
    field.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    expect(values).toEqual(['hello']);
  });

  it('does not send when disabled', async () => {
    const input = await render(html`
      <md-action-input label="Label" value="hello" disabled></md-action-input>
    `);
    let sent = false;
    input.addEventListener('send', () => {
      sent = true;
    });

    expect(iconColor(input)).toBe('rgba(0, 0, 0, 0.38)');
    sendOf(input).click();
    expect(sent).toBeFalse();
  });
});

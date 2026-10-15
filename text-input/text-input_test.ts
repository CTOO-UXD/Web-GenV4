/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {sendMouse} from './send-mouse.js';
import {MdTextInput} from './text-input.js';

describe('<md-text-input>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(MdTextInput.styles);
  });

  async function render(template = html`<md-text-input label="Label"></md-text-input>`) {
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector('md-text-input')!;
  }

  function fieldOf(input: MdTextInput) {
    return input.renderRoot.querySelector('input')!;
  }

  function labelOf(input: MdTextInput) {
    return input.renderRoot.querySelector('.label')!;
  }

  function boxOf(input: MdTextInput) {
    return input.renderRoot.querySelector<HTMLElement>('.field')!;
  }

  async function pointAt(element: Element) {
    const box = element.getBoundingClientRect();
    return [
      Math.round(box.x + box.width / 2),
      Math.round(box.y + box.height / 2),
    ] as [number, number];
  }

  async function hover(element: Element) {
    await sendMouse({type: 'move', position: await pointAt(element)});
  }

  async function press(element: Element) {
    const position = await pointAt(element);
    await sendMouse({type: 'move', position});
    await sendMouse({type: 'down'});
  }

  it('shows only the large label when empty', async () => {
    const input = await render();

    expect(labelOf(input).textContent).toBe('Label');
    expect(input.renderRoot.querySelector('.stacked')).toBeNull();
    expect(getComputedStyle(labelOf(input)).fontSize).toBe('16px');
    expect(getComputedStyle(input.renderRoot.querySelector('.field')!).height).toBe(
      '56px',
    );
    expect(input.renderRoot.querySelector('.supporting')).toBeNull();
    expect(labelOf(input).textContent).not.toContain('*');
  });

  it('stacks the label when there is a placeholder or a value', async () => {
    const input = await render(html`
      <md-text-input label="Label" placeholder="Placeholder text"></md-text-input>
    `);

    expect(input.renderRoot.querySelector('.stacked')).not.toBeNull();
    expect(getComputedStyle(labelOf(input)).fontSize).toBe('12px');
    expect(fieldOf(input).placeholder).toBe('Placeholder text');

    input.value = 'Input text';
    await input.updateComplete;
    expect(fieldOf(input).value).toBe('Input text');
  });

  it('clears text on focus and keeps the caret in the field', async () => {
    const input = await render(html`<md-text-input label="Label" value="Input text"></md-text-input>`);
    const field = fieldOf(input);
    const clear = input.renderRoot.querySelector('md-icon-button')!;
    expect(getComputedStyle(clear).display).toBe('none');
    field.focus();
    await input.updateComplete;

    expect(getComputedStyle(clear).display).not.toBe('none');
    let valueOnInput = 'unchanged';
    input.addEventListener('input', () => {
      valueOnInput = input.value;
    });
    clear.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}));
    clear.click();
    await input.updateComplete;

    expect(input.value).toBe('');
    expect(valueOnInput).toBe('');
    expect(field.matches(':focus')).toBeTrue();
    expect(input.renderRoot.querySelector('md-icon-button')).not.toBeNull();
  });

  it('does not show clear when read-only', async () => {
    const input = await render(html`
      <md-text-input label="Label" value="Input text" readOnly></md-text-input>
    `);
    fieldOf(input).focus();
    await input.updateComplete;

    expect(fieldOf(input).readOnly).toBeTrue();
    expect(input.renderRoot.querySelector('md-icon-button')).toBeNull();
  });

  it('shows supporting text, then the page error, then the browser message', async () => {
    const input = await render(html`
      <md-text-input label="Label" supporting-text="Helper text"></md-text-input>
    `);
    const support = () => input.renderRoot.querySelector('.supporting')!;

    expect(support().textContent).toContain('Helper text');
    expect(support().querySelector('md-icon')).toBeNull();

    input.error = true;
    input.errorText = 'Error text';
    await input.updateComplete;
    expect(support().textContent).toContain('Error text');
    expect(support().querySelector('md-icon')!.textContent).toBe('error');

    input.errorText = '';
    input.required = true;
    await input.updateComplete;
    expect(input.renderRoot.querySelector('.supporting')).toBeNull();

    expect(input.reportValidity()).toBeFalse();
    await input.updateComplete;
    expect(support().textContent).toContain(input.validationMessage);
    expect(input.validationMessage.length).toBeGreaterThan(0);
  });

  it('limits length, disables editing, and passes autocomplete through', async () => {
    const input = await render(html`
      <md-text-input
        label="Label"
        maxlength="3"
        autocomplete="email"
        disabled></md-text-input>
    `);
    const field = fieldOf(input);

    expect(field.maxLength).toBe(3);
    expect(field.disabled).toBeTrue();
    expect(field.getAttribute('autocomplete')).toBe('email');
    expect(getComputedStyle(labelOf(input)).color).toBe('rgba(0, 0, 0, 0.38)');
  });

  it('keeps the error outline and layers on hover, press, and focus', async () => {
    const input = await render(html`
      <md-text-input label="Label" value="Input text" error></md-text-input>
    `);
    const field = boxOf(input);
    const layer = () => getComputedStyle(field, '::before').backgroundColor;
    const outline = () => getComputedStyle(field).borderTopColor;

    expect(outline()).toBe('rgb(186, 26, 26)');
    expect(layer()).toBe('rgba(0, 0, 0, 0)');

    await hover(input);
    const hovered = layer();
    expect(outline()).toBe('rgb(186, 26, 26)');
    expect(hovered).not.toBe('rgba(0, 0, 0, 0)');

    await press(input);
    const pressed = layer();
    expect(outline()).toBe('rgb(186, 26, 26)');
    expect(pressed).not.toBe(hovered);

    await sendMouse({type: 'up'});
    fieldOf(input).focus();
    expect(outline()).toBe('rgb(186, 26, 26)');
    expect(layer()).toBe(pressed);
  });

  it('submits and resets with the form', async () => {
    const root = env.render(html`
      <form>
        <md-text-input name="email" value="a@b.c"></md-text-input>
      </form>
    `);
    await env.waitForStability();
    const form = root.querySelector('form')!;
    const input = root.querySelector('md-text-input')!;

    expect(new FormData(form).get('email')).toBe('a@b.c');

    input.value = 'changed';
    await input.updateComplete;
    form.reset();
    await input.updateComplete;

    expect(input.value).toBe('a@b.c');
  });
});

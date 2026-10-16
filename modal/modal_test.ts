/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdModal} from './modal.js';

describe('<md-modal>', () => {
  const env = new Environment();

  async function setup(
    template = html`<md-modal
      title="Title"
      show-cancel
      show-secondary-action
      show-tertiary-action>
      Body
      <span slot="cancel">Cancel</span>
      <span slot="secondary">Secondary</span>
      <span slot="primary">Primary</span>
      <span slot="tertiary">More</span>
    </md-modal>`,
  ) {
    const root = env.render(template);
    const modal = root.querySelector('md-modal')!;
    modal.getOpenAnimation = () => ({});
    modal.getCloseAnimation = () => ({});
    await env.waitForStability();
    return modal;
  }

  function buttonWith(modal: MdModal, selector: string, label: string) {
    return [...modal.shadowRoot!.querySelectorAll<HTMLElement>(selector)].find((button) =>
      [...button.querySelectorAll('slot')].some((slot) =>
        slot.assignedNodes().some((node) => node.textContent?.includes(label)),
      ),
    )!;
  }

  function iconText(modal: MdModal) {
    return modal.shadowRoot!.querySelector('.leading')!.textContent!.trim();
  }

  describe('tokens', () => {
    createTokenTests(MdModal.styles);
  });

  it('defaults to the narrow max width', async () => {
    const modal = await setup();
    expect(modal.size).toBe('narrow');
    expect(getComputedStyle(modal.shadowRoot!.querySelector('dialog')!).maxWidth).toContain(
      '448px',
    );
  });

  it('uses the wide max width when size is wide', async () => {
    const modal = await setup(html`<md-modal size="wide"></md-modal>`);
    expect(getComputedStyle(modal.shadowRoot!.querySelector('dialog')!).maxWidth).toContain(
      '640px',
    );
  });

  it('opens with a scrim and closes from the primary button', async () => {
    const modal = await setup();
    const closed = new Promise<void>((resolve) => {
      modal.addEventListener('closed', () => resolve(), {once: true});
    });
    await modal.show();
    expect(modal.shadowRoot!.querySelector('dialog')!.open).toBeTrue();
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.scrim')!).display).not.toBe(
      'none',
    );

    buttonWith(modal, 'md-filled-button', 'Primary').click();
    await closed;
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('primary');
  });

  it('records which button closed it', async () => {
    const modal = await setup(html`<md-modal close show-secondary-action show-tertiary-action>
      <span slot="secondary">Secondary</span>
      <span slot="primary">Primary</span>
      <span slot="tertiary">More</span>
    </md-modal>`);
    await modal.show();
    modal.shadowRoot!.querySelector('md-icon-button')!.click();
    await env.waitForStability();
    expect(modal.returnValue).toBe('close');

    await modal.show();
    buttonWith(modal, 'md-outlined-button', 'Secondary').click();
    await env.waitForStability();
    expect(modal.returnValue).toBe('secondary');

    await modal.show();
    buttonWith(modal, 'md-text-button', 'More').click();
    await env.waitForStability();
    expect(modal.returnValue).toBe('tertiary');
  });

  it('cancels from the cancel button without changing returnValue', async () => {
    const modal = await setup();
    const cancel = jasmine.createSpy('cancel');
    modal.addEventListener('cancel', cancel);
    await modal.show();
    modal.returnValue = 'kept';
    buttonWith(modal, 'md-text-button', 'Cancel').click();
    await env.waitForStability();
    expect(cancel).toHaveBeenCalled();
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('kept');
  });

  it('cancels from the scrim and Escape', async () => {
    const modal = await setup();
    const cancel = jasmine.createSpy('cancel');
    modal.addEventListener('cancel', cancel);
    await modal.show();
    modal.shadowRoot!.querySelector('dialog')!.click();
    await env.waitForStability();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(modal.open).toBeFalse();

    await modal.show();
    const dialog = modal.shadowRoot!.querySelector('dialog')!;
    dialog.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    dialog.dispatchEvent(new Event('cancel', {cancelable: true}));
    await env.waitForStability();
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(modal.open).toBeFalse();
  });

  it('stays open when cancel is prevented', async () => {
    const modal = await setup();
    modal.addEventListener('cancel', (event) => event.preventDefault());
    await modal.show();
    buttonWith(modal, 'md-text-button', 'Cancel').click();
    await env.waitForStability();
    expect(modal.open).toBeTrue();
  });

  it('uses the variant icon and the hardcoded success color', async () => {
    const modal = await setup();
    expect(iconText(modal)).toBe('interests');

    modal.variant = 'informational';
    await modal.updateComplete;
    expect(iconText(modal)).toBe('info');

    modal.variant = 'success';
    await modal.updateComplete;
    expect(iconText(modal)).toBe('check_circle');
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.leading')!).color).toBe(
      'rgb(62, 134, 67)',
    );

    modal.variant = 'error';
    await modal.updateComplete;
    expect(iconText(modal)).toBe('error');

    modal.variant = 'destructive';
    await modal.updateComplete;
    expect(iconText(modal)).toBe('warning');
    expect(
      getComputedStyle(modal.shadowRoot!.querySelector('md-filled-button')!).getPropertyValue(
        '--md-filled-button-container-color',
      ),
    ).toBe('#ba1a1a');

    modal.variant = 'system';
    await modal.updateComplete;
    expect(iconText(modal)).toBe('system');
  });

  it('hides optional actions and switches the tertiary control', async () => {
    const modal = await setup(html`<md-modal><span slot="primary">Primary</span></md-modal>`);
    expect(modal.shadowRoot!.querySelector('md-text-button')).toBeNull();
    expect(modal.shadowRoot!.querySelector('md-outlined-button')).toBeNull();
    expect(modal.shadowRoot!.querySelector('md-icon-button')).toBeNull();

    modal.showTertiaryAction = true;
    modal.tertiary = 'checkbox';
    await modal.updateComplete;
    expect(modal.shadowRoot!.querySelector('md-checkbox')).not.toBeNull();
  });

  it('pads content by 20px unless content margin is off', async () => {
    const modal = await setup();
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.body')!).paddingLeft).toBe(
      '20px',
    );
    modal.contentMargin = false;
    await modal.updateComplete;
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.body')!).paddingLeft).toBe(
      '0px',
    );
  });

  it('stacks actions vertically', async () => {
    const modal = await setup();
    modal.layout = 'vertical';
    await modal.updateComplete;
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.actions')!).flexDirection).toBe(
      'column',
    );
  });

  it('keeps the title on one line and the subtitle on two', async () => {
    const modal = await setup(html`<md-modal title="Title" subtitle="Sub" show-subtitle></md-modal>`);
    const title = modal.shadowRoot!.querySelector('h2')!;
    const subtitle = modal.shadowRoot!.querySelector('.subtitle')!;
    expect(getComputedStyle(title).whiteSpace).toBe('nowrap');
    expect(getComputedStyle(subtitle).webkitLineClamp).toBe('2');
  });
});

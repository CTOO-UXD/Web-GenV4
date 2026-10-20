/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdLoadingModal} from './loading-modal.js';

describe('<md-loading-modal>', () => {
  const env = new Environment();

  async function setup(template = html`
    <md-loading-modal title="Loading">
      Please wait
      <span slot="cancel">Cancel</span>
    </md-loading-modal>
  `) {
    const root = env.render(template);
    const modal = root.querySelector<MdLoadingModal>('md-loading-modal')!;
    modal.getOpenAnimation = () => ({});
    modal.getCloseAnimation = () => ({});
    await env.waitForStability();
    await modal.updateComplete;
    return modal;
  }

  function panel(modal: MdLoadingModal) {
    return modal.shadowRoot!.querySelector<HTMLElement>('.panel')!;
  }

  describe('tokens', () => {
    createTokenTests(MdLoadingModal.styles);
  });

  it('defaults to a large modal', async () => {
    const modal = await setup();
    expect(modal.size).toBe('large');
    expect(modal.container).toBe('modal');
    expect(modal.actions).toBeFalse();
    expect(modal.closeButton).toBeFalse();
  });

  it('sizes large and medium within the width range', async () => {
    const modal = await setup();
    await modal.show();
    const limit = window.innerWidth - 40;
    const large = panel(modal).getBoundingClientRect().width;
    expect(large).toBeCloseTo(Math.min(520, limit), 0);

    modal.size = 'medium';
    await modal.updateComplete;
    const medium = panel(modal).getBoundingClientRect().width;
    expect(medium).toBeCloseTo(Math.min(320, limit), 0);
  });

  it('uses a fixed card for a small modal and only the spinner inline', async () => {
    const modal = await setup();
    modal.size = 'small';
    await modal.show();
    const card = panel(modal).getBoundingClientRect();
    expect(card.width).toBeCloseTo(80, 0);
    expect(card.height).toBeCloseTo(80, 0);
    expect(modal.shadowRoot!.querySelector('h2')).toBeNull();

    modal.container = 'inline';
    await modal.updateComplete;
    expect(modal.shadowRoot!.querySelector('dialog')).toBeNull();
    expect(modal.shadowRoot!.querySelector('md-elevation')).toBeNull();
    const spinner = modal.shadowRoot!.querySelector('md-circular-progress')!;
    expect(spinner.getBoundingClientRect().width).toBeCloseTo(48, 0);
  });

  it('keeps a modal open for scrim clicks and Escape', async () => {
    const modal = await setup();
    let canceled = 0;
    modal.addEventListener('cancel', () => {
      canceled += 1;
    });
    await modal.show();
    const dialog = modal.shadowRoot!.querySelector('dialog')!;
    expect(dialog.matches(':modal')).toBeTrue();
    modal.shadowRoot!.querySelector<HTMLElement>('.scrim')!.click();
    dialog.dispatchEvent(new Event('cancel', {bubbles: true, cancelable: true}));
    await modal.updateComplete;
    expect(dialog.open).toBeTrue();
    expect(canceled).toBe(0);
  });

  it('leaves inline in the page without a scrim', async () => {
    const modal = await setup();
    modal.container = 'inline';
    modal.actions = true;
    modal.closeButton = true;
    await modal.updateComplete;
    expect(modal.shadowRoot!.querySelector('.scrim')).toBeNull();
    expect(modal.shadowRoot!.querySelector('.actions')).toBeNull();
    expect(modal.shadowRoot!.querySelector('.close')).toBeNull();
    expect(getComputedStyle(modal).animationDuration).toBe('0.05s');
  });

  it('spins without a value', async () => {
    const modal = await setup();
    await modal.show();
    const progress = modal.shadowRoot!.querySelector('md-circular-progress')!;
    expect(progress.indeterminate).toBeTrue();
    expect(progress.getBoundingClientRect().width).toBeCloseTo(48, 0);
  });

  it('drops empty title and message', async () => {
    const modal = await setup(html`<md-loading-modal></md-loading-modal>`);
    await modal.show();
    expect(modal.shadowRoot!.querySelector('h2')).toBeNull();
    expect(modal.shadowRoot!.querySelector('.text')!.hasAttribute('hidden')).toBeTrue();
  });

  it('uses the large and medium title sizes', async () => {
    const modal = await setup();
    await modal.show();
    const large = getComputedStyle(modal.shadowRoot!.querySelector('h2')!);
    expect(large.fontSize).toBe('22px');
    expect(large.fontWeight).toBe('700');
    expect(large.lineHeight).toBe('28px');

    modal.size = 'medium';
    await modal.updateComplete;
    const medium = getComputedStyle(modal.shadowRoot!.querySelector('h2')!);
    expect(medium.fontSize).toBe('16px');
    expect(medium.fontWeight).toBe('500');
  });

  it('hides actions and close on small modals', async () => {
    const modal = await setup();
    modal.size = 'small';
    modal.actions = true;
    modal.closeButton = true;
    await modal.updateComplete;
    expect(modal.shadowRoot!.querySelector('.actions')).toBeNull();
    expect(modal.shadowRoot!.querySelector('.close')).toBeNull();
  });

  it('replaces the spinner with a check and stays open', async () => {
    const modal = await setup();
    await modal.show();
    modal.complete = true;
    await modal.updateComplete;
    expect(modal.open).toBeTrue();
    expect(modal.hasAttribute('complete')).toBeTrue();
    const icon = modal.shadowRoot!.querySelector('md-icon')!;
    expect(icon.textContent!.trim()).toBe('check_circle');
    const iconStyle = getComputedStyle(icon);
    expect(iconStyle.color).toBe('rgb(62, 134, 67)');
    expect(iconStyle.fontSize).toBe('48px');
    expect(iconStyle.transitionDuration).toBe('0.2s, 0.2s');
    icon.getAnimations().forEach((animation) => {
      animation.finish();
    });
    const progress = modal.shadowRoot!.querySelector('md-circular-progress')!;
    progress.getAnimations().forEach((animation) => {
      animation.finish();
    });
    expect(getComputedStyle(icon).opacity).toBe('1');
    expect(getComputedStyle(progress).opacity).toBe('0');

    await modal.close();
    await modal.show();
    expect(modal.complete).toBeFalse();
    expect(modal.shadowRoot!.querySelector('md-circular-progress')!.indeterminate).toBeTrue();
  });

  it('closes from the close button and cancel button', async () => {
    const modal = await setup();
    modal.actions = true;
    modal.closeButton = true;
    modal.returnValue = 'kept';
    let canceled = 0;
    modal.addEventListener('cancel', () => {
      canceled += 1;
    });
    await modal.show();
    const closed = () =>
      new Promise<void>((resolve) => {
        modal.addEventListener('closed', () => resolve(), {once: true});
      });
    modal.shadowRoot!.querySelector<HTMLElement>('.close')!.click();
    await closed();
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('close');

    await modal.show();
    modal.returnValue = 'kept';
    modal.shadowRoot!.querySelector<HTMLElement>('md-filled-button')!.click();
    await closed();
    expect(canceled).toBe(1);
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('kept');
  });
});

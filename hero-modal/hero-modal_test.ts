/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdHeroModal} from './hero-modal.js';
import '../iconbutton/filled-icon-button.js';
import '../iconbutton/outlined-icon-button.js';

describe('<md-hero-modal>', () => {
  const env = new Environment();

  async function setup(template = html`
    <md-hero-modal>
      <img slot="hero" alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      <section>
        <h2>One</h2>
        <p>Body</p>
      </section>
      <section><h2>Two</h2></section>
      <section><h2>Three</h2></section>
      <section><h2>Four</h2></section>
      <span slot="primary">Primary</span>
      <span slot="cancel">Cancel</span>
      <md-outlined-icon-button slot="previous" aria-label="Previous"></md-outlined-icon-button>
      <md-filled-icon-button slot="next" aria-label="Next"><md-icon>arrow_forward</md-icon></md-filled-icon-button>
    </md-hero-modal>
  `) {
    const root = env.render(template);
    const modal = root.querySelector('md-hero-modal')!;
    modal.getOpenAnimation = () => ({});
    modal.getCloseAnimation = () => ({});
    await env.waitForStability();
    await modal.updateComplete;
    return modal;
  }

  function buttonWith(modal: MdHeroModal, selector: string, label: string) {
    return [...modal.shadowRoot!.querySelectorAll<HTMLElement>(selector)].find((button) =>
      [...button.querySelectorAll('slot')].some((slot) =>
        slot.assignedNodes().some((node) => node.textContent?.includes(label)),
      ),
    )!;
  }

  function dialogOf(modal: MdHeroModal) {
    return modal.shadowRoot!.querySelector('dialog')!;
  }

  describe('tokens', () => {
    createTokenTests(MdHeroModal.styles);
  });

  it('uses the three size widths and stacks until pc', async () => {
    const modal = await setup();
    const dialog = dialogOf(modal);
    expect(modal.size).toBe('mobile');
    expect(getComputedStyle(dialog).maxWidth).toContain('316px');
    expect(getComputedStyle(dialog).maxWidth).toContain('40px');

    modal.size = 'tablet';
    await modal.updateComplete;
    expect(getComputedStyle(dialog).maxWidth).toContain('560px');

    modal.size = 'pc';
    await modal.updateComplete;
    expect(getComputedStyle(dialog).maxWidth).toContain('832px');
    expect(getComputedStyle(dialog).maxWidth).toContain('40px');
  });

  it('clamps a page-set width and keeps mobile fixed', async () => {
    const modal = await setup();
    modal.size = 'tablet';
    await modal.show();
    expect(dialogOf(modal).getBoundingClientRect().width).toBe(500);

    modal.style.setProperty('--md-hero-modal-width', '400px');
    await modal.updateComplete;
    expect(dialogOf(modal).getBoundingClientRect().width).toBe(400);

    modal.style.setProperty('--md-hero-modal-width', '900px');
    await modal.updateComplete;
    expect(dialogOf(modal).getBoundingClientRect().width).toBe(560);

    modal.size = 'pc';
    modal.style.removeProperty('--md-hero-modal-width');
    await modal.updateComplete;
    expect(dialogOf(modal).getBoundingClientRect().width).toBe(
      Math.min(832, window.innerWidth - 40),
    );

    modal.style.setProperty('--md-hero-modal-width', '200px');
    await modal.updateComplete;
    expect(dialogOf(modal).getBoundingClientRect().width).toBe(632);

    modal.size = 'mobile';
    modal.style.setProperty('--md-hero-modal-width', '500px');
    await modal.updateComplete;
    expect(dialogOf(modal).getBoundingClientRect().width).toBe(316);
  });

  it('keeps the card between 416 and 640 and places the hero', async () => {
    const modal = await setup(html`<md-hero-modal>
      <div slot="hero"></div>
      <section>Short</section>
    </md-hero-modal>`);
    await modal.show();
    const container = modal.shadowRoot!.querySelector('.container')!;
    const clip = modal.shadowRoot!.querySelector('.clip')!;
    const hero = modal.shadowRoot!.querySelector('.hero')!;
    expect(getComputedStyle(container).minHeight).toBe('416px');
    expect(getComputedStyle(container).maxHeight).toBe('640px');
    expect(container.getBoundingClientRect().height).toBeGreaterThanOrEqual(416);
    expect(container.getBoundingClientRect().height).toBeLessThanOrEqual(640);
    expect(getComputedStyle(clip).flexDirection).toBe('column');
    expect(getComputedStyle(hero).height).toBe('240px');
    expect(getComputedStyle(container).borderRadius).toBe('24px');

    modal.size = 'tablet';
    await modal.updateComplete;
    expect(getComputedStyle(hero).height).toBe('264px');

    modal.size = 'pc';
    await modal.updateComplete;
    expect(getComputedStyle(clip).flexDirection).toBe('row');
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.main')!).width).toBe('416px');

    modal.size = 'mobile';
    const page = modal.querySelector('section')!;
    page.style.height = '2000px';
    await modal.updateComplete;
    expect(container.getBoundingClientRect().height).toBeLessThanOrEqual(640);
  });

  it('opens with a scrim and cancels from the scrim, Escape, and cancel', async () => {
    const modal = await setup();
    const cancel = jasmine.createSpy('cancel');
    modal.addEventListener('cancel', cancel);
    await modal.show();
    expect(dialogOf(modal).open).toBeTrue();
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.scrim')!).display).not.toBe(
      'none',
    );

    dialogOf(modal).click();
    await env.waitForStability();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('');

    await modal.show();
    modal.showCancel = true;
    modal.returnValue = 'kept';
    await modal.updateComplete;
    buttonWith(modal, 'md-text-button', 'Cancel').click();
    await env.waitForStability();
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(modal.returnValue).toBe('kept');

    await modal.show();
    const dialog = dialogOf(modal);
    dialog.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    dialog.dispatchEvent(new Event('cancel', {cancelable: true}));
    await env.waitForStability();
    expect(cancel).toHaveBeenCalledTimes(3);
    expect(modal.open).toBeFalse();
  });

  it('closes from the close button and the primary button', async () => {
    const modal = await setup();
    expect(modal.closeButton).toBeTrue();
    await modal.show();
    const close = modal.shadowRoot!.querySelector('md-icon-button')!;
    const dialogBox = dialogOf(modal).getBoundingClientRect();
    const closeBox = close.getBoundingClientRect();
    expect(close.textContent).toContain('close');
    expect(closeBox.width).toBe(40);
    expect(Math.round(closeBox.top - dialogBox.top)).toBe(16);
    expect(Math.round(dialogBox.right - closeBox.right)).toBe(16);
    const actions = modal.shadowRoot!.querySelector('.default-actions')!;
    expect(getComputedStyle(actions).paddingTop).toBe('20px');
    expect(getComputedStyle(actions).paddingBottom).toBe('20px');
    expect(getComputedStyle(actions).paddingLeft).toBe('32px');
    expect(getComputedStyle(actions).paddingRight).toBe('20px');
    close.click();
    await env.waitForStability();
    expect(modal.returnValue).toBe('close');

    await modal.show();
    modal.showCancel = true;
    await modal.updateComplete;
    const primary = buttonWith(modal, 'md-filled-button', 'Primary');
    const cancel = buttonWith(modal, 'md-text-button', 'Cancel');
    expect(primary.getBoundingClientRect().top).toBeLessThan(cancel.getBoundingClientRect().top);
    expect(modal.shadowRoot!.querySelector('md-outlined-button')).toBeNull();

    for (const size of ['tablet', 'pc'] as const) {
      modal.size = size;
      await modal.updateComplete;
      const primaryBox = primary.getBoundingClientRect();
      const cancelBox = cancel.getBoundingClientRect();
      expect(cancelBox.right).toBeLessThanOrEqual(primaryBox.left);
      expect(Math.abs(primaryBox.top - cancelBox.top)).toBeLessThan(2);
    }
    primary.click();
    await env.waitForStability();
    expect(modal.returnValue).toBe('primary');
  });

  it('uses the optional footer actions', async () => {
    const modal = await setup(html`<md-hero-modal
      show-cancel
      show-secondary-action
      show-tertiary-action>
      <div slot="hero"></div>
      <section>Short</section>
      <span slot="primary">Primary</span>
      <span slot="cancel">Cancel</span>
      <span slot="secondary">Secondary</span>
      <span slot="tertiary">Tertiary</span>
    </md-hero-modal>`);
    await modal.show();
    const primary = buttonWith(modal, 'md-filled-button', 'Primary');
    const secondary = buttonWith(modal, 'md-outlined-button', 'Secondary');
    const cancel = buttonWith(modal, 'md-text-button', 'Cancel');
    const tertiary = buttonWith(modal, 'md-text-button', 'Tertiary');
    expect(tertiary.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      primary.getBoundingClientRect().top,
    );
    expect(primary.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      secondary.getBoundingClientRect().top,
    );
    expect(secondary.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      cancel.getBoundingClientRect().top,
    );

    modal.size = 'tablet';
    await modal.updateComplete;
    expect(tertiary.getBoundingClientRect().right).toBeLessThanOrEqual(
      cancel.getBoundingClientRect().left,
    );
    expect(cancel.getBoundingClientRect().right).toBeLessThanOrEqual(
      secondary.getBoundingClientRect().left,
    );
    expect(secondary.getBoundingClientRect().right).toBeLessThanOrEqual(
      primary.getBoundingClientRect().left,
    );

    secondary.click();
    await env.waitForStability();
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('secondary');

    modal.tertiary = 'checkbox';
    modal.returnValue = '';
    await modal.show();
    const label = modal.querySelector<HTMLElement>('[slot="tertiary"]')!;
    label.click();
    await modal.updateComplete;
    const box = modal.shadowRoot!.querySelector('md-checkbox') as HTMLElement & {
      checked: boolean;
    };
    expect(box.checked).toBeTrue();
    expect(modal.open).toBeTrue();
  });

  it('uses surface, on-surface, and primary', async () => {
    const modal = await setup();
    await modal.show();
    const container = modal.shadowRoot!.querySelector('.container')!;
    expect(getComputedStyle(container, '::before').backgroundColor).toBe('rgb(255, 255, 255)');
    const page = modal.querySelector('[data-current]')!;
    expect(getComputedStyle(page).color).toBe('rgb(28, 27, 27)');
    const title = page.querySelector('h2')!;
    expect(getComputedStyle(title).fontSize).toBe('28px');
    expect(getComputedStyle(title).lineHeight).toBe('36px');
    expect(getComputedStyle(title).fontWeight).toBe('700');
    expect(getComputedStyle(page.querySelector('p')!).fontSize).toBe('16px');
    expect(getComputedStyle(page.querySelector('p')!).lineHeight).toBe('24px');
    const filled = modal.shadowRoot!.querySelector('md-filled-button')!;
    expect(getComputedStyle(filled).getPropertyValue('--md-filled-button-container-color').trim()).toContain(
      '#6c43c6',
    );
  });

  it('insets the title and content, and can sit flush', async () => {
    const modal = await setup(html`<md-hero-modal>
      <section>
        <h2>One</h2>
        <p>Body</p>
        <div>Extra</div>
      </section>
    </md-hero-modal>`);
    await modal.show();
    const title = modal.querySelector('h2')!;
    const body = modal.querySelector('p')!;
    const extra = modal.querySelector('div')!;
    expect(getComputedStyle(title).marginTop).toBe('16px');
    expect(getComputedStyle(title).marginLeft).toBe('20px');
    expect(getComputedStyle(title).marginRight).toBe('20px');
    expect(getComputedStyle(title).marginBottom).toBe('0px');
    expect(getComputedStyle(body).marginTop).toBe('8px');
    expect(getComputedStyle(body).marginLeft).toBe('20px');
    expect(getComputedStyle(body).marginBottom).toBe('16px');
    expect(getComputedStyle(extra).marginTop).toBe('0px');
    expect(getComputedStyle(extra).marginLeft).toBe('20px');

    modal.size = 'pc';
    await modal.updateComplete;
    expect(getComputedStyle(title).marginLeft).toBe('32px');
    expect(getComputedStyle(body).marginBottom).toBe('16px');
    expect(getComputedStyle(extra).marginLeft).toBe('32px');

    modal.contentMargin = false;
    await modal.updateComplete;
    expect(getComputedStyle(title).marginLeft).toBe('32px');
    expect(getComputedStyle(body).marginLeft).toBe('32px');
    expect(getComputedStyle(extra).marginRight).toBe('0px');
    expect(getComputedStyle(title).marginTop).toBe('16px');
  });

  it('clips content until scroll-bar is set', async () => {
    const modal = await setup(html`<md-hero-modal>
      <section style="height: 2000px">Tall</section>
    </md-hero-modal>`);
    await modal.show();
    const pages = modal.shadowRoot!.querySelector('.pages') as HTMLElement;
    expect(modal.scrollBar).toBeFalse();
    expect(getComputedStyle(pages).overflowY).toBe('hidden');
    expect(getComputedStyle(pages).maxHeight).toBe('496px');

    modal.scrollBar = true;
    await modal.updateComplete;
    expect(getComputedStyle(pages).overflowY).toBe('auto');
    pages.scrollTop = 40;
    expect(pages.scrollTop).toBeGreaterThan(0);
  });

  it('pages a walkthrough from buttons, dots, and swipes', async () => {
    const modal = await setup();
    modal.type = 'walkthrough';
    await modal.show();
    const hero = modal.querySelector('[slot="hero"]');
    const pages = [...modal.querySelectorAll('section')];
    expect(modal.shadowRoot!.querySelectorAll('.dot')).toHaveSize(4);
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.prev')!).display).toBe('none');
    expect(pages[0].hasAttribute('data-current')).toBeTrue();

    modal.querySelector<HTMLElement>('[slot="next"]')!.click();
    await modal.updateComplete;
    expect(hero).toBe(modal.querySelector('[slot="hero"]'));
    expect(pages[1].hasAttribute('data-current')).toBeTrue();
    expect(getComputedStyle(modal.shadowRoot!.querySelector('.prev')!).display).not.toBe('none');
    const previous = modal.querySelector('md-outlined-icon-button')!;
    expect(previous.getBoundingClientRect().width).toBe(48);

    modal.shadowRoot!.querySelector('.container')!.dispatchEvent(
      new WheelEvent('wheel', {deltaX: 80, bubbles: true, cancelable: true}),
    );
    await modal.updateComplete;
    expect(pages[2].hasAttribute('data-current')).toBeTrue();

    modal.shadowRoot!.querySelectorAll<HTMLButtonElement>('.dot')[3].click();
    await modal.updateComplete;
    expect(pages[3].hasAttribute('data-current')).toBeTrue();
    expect(modal.querySelector('[slot="next"] md-icon')!.textContent?.trim()).toBe('check');

    const heroSurface = modal.shadowRoot!.querySelector('.hero')!;
    heroSurface.dispatchEvent(new PointerEvent('pointerdown', {clientX: 200, bubbles: true}));
    heroSurface.dispatchEvent(new PointerEvent('pointerup', {clientX: 80, bubbles: true}));
    await modal.updateComplete;
    expect(pages[3].hasAttribute('data-current')).toBeTrue();
    expect(modal.open).toBeTrue();

    heroSurface.dispatchEvent(new PointerEvent('pointerdown', {clientX: 200, bubbles: true}));
    heroSurface.dispatchEvent(new PointerEvent('pointerup', {clientX: 320, bubbles: true}));
    await modal.updateComplete;
    expect(pages[2].hasAttribute('data-current')).toBeTrue();
    expect(modal.querySelector('[slot="next"] md-icon')!.textContent?.trim()).toBe('arrow_forward');

    modal.shadowRoot!.querySelectorAll<HTMLButtonElement>('.dot')[3].click();
    await modal.updateComplete;
    modal.querySelector<HTMLElement>('[slot="next"]')!.click();
    await env.waitForStability();
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('done');
  });

  it('shows only the first page for the default type', async () => {
    const modal = await setup();
    await modal.show();
    expect(modal.type).toBe('default');
    expect(modal.shadowRoot!.querySelector('.dot')).toBeNull();
    expect(modal.querySelectorAll('[data-current]')).toHaveSize(1);
    expect(modal.querySelector('section')!.hasAttribute('data-current')).toBeTrue();
  });
});

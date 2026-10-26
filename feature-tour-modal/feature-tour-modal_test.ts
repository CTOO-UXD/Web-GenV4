/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdFeatureTourModal} from './feature-tour-modal.js';
import '../iconbutton/filled-icon-button.js';
import '../iconbutton/outlined-icon-button.js';

describe('<md-feature-tour-modal>', () => {
  const env = new Environment();

  async function setup(template = html`
    <md-feature-tour-modal>
      <img slot="hero" alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
      <section>
        <h2>One</h2>
        <p>Body</p>
        <div class="extra">More</div>
      </section>
      <section><h2>Two</h2></section>
      <section><h2>Three</h2></section>
      <section><h2>Four</h2></section>
      <span slot="primary">Primary</span>
      <span slot="cancel">Cancel</span>
      <span slot="secondary">Secondary</span>
      <span slot="tertiary">Tertiary</span>
      <md-outlined-icon-button slot="previous" aria-label="Previous"></md-outlined-icon-button>
      <md-filled-icon-button slot="next" aria-label="Next"><md-icon>arrow_forward</md-icon></md-filled-icon-button>
    </md-feature-tour-modal>
  `) {
    const root = env.render(template);
    const modal = root.querySelector('md-feature-tour-modal')!;
    modal.getOpenAnimation = () => ({});
    modal.getCloseAnimation = () => ({});
    await env.waitForStability();
    await modal.updateComplete;
    return modal;
  }

  function buttonWith(modal: MdFeatureTourModal, selector: string, label: string) {
    return [...modal.shadowRoot!.querySelectorAll<HTMLElement>(selector)].find((button) =>
      [...button.querySelectorAll('slot')].some((slot) =>
        slot.assignedNodes().some((node) => node.textContent?.includes(label)),
      ),
    );
  }

  function whenClosed(modal: MdFeatureTourModal) {
    return new Promise<void>((resolve) => {
      modal.addEventListener('closed', () => {
        resolve();
      }, {once: true});
    });
  }

  function dialogOf(modal: MdFeatureTourModal) {
    return modal.shadowRoot!.querySelector('dialog')!;
  }

  function near(actual: number, expected: number) {
    expect(Math.abs(actual - expected)).toBeLessThan(1.5);
  }

  describe('tokens', () => {
    createTokenTests(MdFeatureTourModal.styles);
  });

  it('uses one width and has no size', async () => {
    const modal = await setup();
    expect(modal.hasAttribute('size')).toBeFalse();
    await modal.show();
    expect(modal.getBoundingClientRect().width).toBe(
      Math.min(500, window.innerWidth - 40),
    );

    modal.style.setProperty('--md-feature-tour-modal-width', '400px');
    await modal.updateComplete;
    expect(modal.getBoundingClientRect().width).toBe(
      Math.min(400, window.innerWidth - 40),
    );

    modal.style.setProperty('--md-feature-tour-modal-width', '900px');
    await modal.updateComplete;
    expect(modal.getBoundingClientRect().width).toBe(
      Math.min(560, window.innerWidth - 40),
    );

    modal.style.setProperty('--md-feature-tour-modal-width', '200px');
    await modal.updateComplete;
    expect(modal.getBoundingClientRect().width).toBe(316);

    const css = MdFeatureTourModal.styles
      .map((style) => ('cssText' in style ? style.cssText : ''))
      .join('');
    expect(css).toContain('100vw - 40px');
  });

  it('keeps the card between 416 and 640 and insets the hero', async () => {
    const modal = await setup(html`<md-feature-tour-modal>
      <section>Short</section>
    </md-feature-tour-modal>`);
    await modal.show();
    const container = modal.shadowRoot!.querySelector('.container')!;
    const hero = modal.shadowRoot!.querySelector('.hero')!;
    const close = modal.shadowRoot!.querySelector('.close')!;
    expect(getComputedStyle(container).minHeight).toBe('416px');
    expect(getComputedStyle(container).maxHeight).toBe('640px');
    expect(container.getBoundingClientRect().height).toBeGreaterThanOrEqual(416);
    expect(container.getBoundingClientRect().height).toBeLessThanOrEqual(640);
    near(hero.getBoundingClientRect().height, 248);
    near(close.getBoundingClientRect().top - hero.getBoundingClientRect().top, 4);
    near(hero.getBoundingClientRect().right - close.getBoundingClientRect().right, 4);
    expect(dialogOf(modal).matches(':modal')).toBeFalse();
    expect(modal.shadowRoot!.querySelector('.scrim')).toBeNull();
  });

  it('leaves the page usable and closes from Escape', async () => {
    const modal = await setup();
    const outside = document.createElement('button');
    outside.textContent = 'Outside';
    modal.before(outside);
    outside.focus();
    await modal.show();
    expect(document.activeElement).toBe(outside);
    outside.click();
    expect(modal.open).toBeTrue();
    expect(dialogOf(modal).matches(':modal')).toBeFalse();

    let canceled = false;
    modal.addEventListener('cancel', () => {
      canceled = true;
    });
    const dialog = dialogOf(modal);
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}),
    );
    dialog.dispatchEvent(new Event('cancel', {cancelable: true}));
    await env.waitForStability();
    expect(canceled).toBeTrue();
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('cancel');
  });

  it('places the caret on four edges', async () => {
    const modal = await setup();
    await modal.show();
    const container = modal.shadowRoot!.querySelector('.container')!;
    const caret = modal.shadowRoot!.querySelector('.caret')!;

    const card = container.getBoundingClientRect();
    let box = caret.getBoundingClientRect();
    near(box.top, card.bottom);
    near(box.height, 26);
    near(box.width, 42);
    near((box.left + box.right) / 2, (card.left + card.right) / 2);

    modal.caretPosition = 'start';
    await modal.updateComplete;
    box = caret.getBoundingClientRect();
    near(box.left, card.left + 48);

    modal.caretPosition = 'end';
    await modal.updateComplete;
    box = caret.getBoundingClientRect();
    near(box.right, card.right - 48);

    modal.caret = 'left';
    modal.caretPosition = 'center';
    await modal.updateComplete;
    const leftCard = container.getBoundingClientRect();
    box = caret.getBoundingClientRect();
    near(box.right, leftCard.left);
    near(box.width, 26);
    near(box.height, 42);
    near((box.top + box.bottom) / 2, (leftCard.top + leftCard.bottom) / 2);

    modal.caret = 'top';
    modal.caretPosition = 'start';
    await modal.updateComplete;
    box = caret.getBoundingClientRect();
    const topCard = container.getBoundingClientRect();
    near(box.bottom, topCard.top);
    near(box.left, topCard.left + 48);

    modal.caret = 'right';
    modal.caretPosition = 'end';
    await modal.updateComplete;
    box = caret.getBoundingClientRect();
    const rightCard = container.getBoundingClientRect();
    near(box.left, rightCard.right);
    near(box.bottom, rightCard.bottom - 48);
  });

  it('styles the page and the content margin', async () => {
    const modal = await setup();
    await modal.show();
    const heading = modal.querySelector('h2')!;
    const extra = modal.querySelector('.extra')!;
    const headingStyle = getComputedStyle(heading);
    expect(headingStyle.fontWeight).toBe('700');
    expect(headingStyle.marginTop).toBe('16px');
    expect(headingStyle.marginLeft).toBe('32px');
    expect(getComputedStyle(extra).marginLeft).toBe('32px');

    modal.contentMargin = false;
    await modal.updateComplete;
    expect(getComputedStyle(heading).marginLeft).toBe('32px');
    expect(getComputedStyle(extra).marginLeft).toBe('0px');
  });

  it('clips or scrolls the pages', async () => {
    const modal = await setup();
    await modal.show();
    const pages = modal.shadowRoot!.querySelector('.pages')!;
    expect(getComputedStyle(pages).overflowY).toBe('hidden');
    expect(getComputedStyle(pages).maxHeight).toBe('496px');
    modal.scrollBar = true;
    await modal.updateComplete;
    expect(getComputedStyle(pages).overflowY).toBe('auto');
  });

  it('shows only the primary action until the switches are on', async () => {
    const modal = await setup();
    await modal.show();
    expect(buttonWith(modal, 'md-filled-button', 'Primary')).toBeDefined();
    expect(buttonWith(modal, 'md-text-button', 'Cancel')).toBeUndefined();
    expect(buttonWith(modal, 'md-outlined-button', 'Secondary')).toBeUndefined();
    expect(buttonWith(modal, 'md-text-button', 'Tertiary')).toBeUndefined();

    modal.showCancel = true;
    modal.showSecondaryAction = true;
    modal.showTertiaryAction = true;
    await modal.updateComplete;
    const tertiary = buttonWith(modal, 'md-text-button', 'Tertiary')!;
    const cancel = buttonWith(modal, 'md-text-button', 'Cancel')!;
    const secondary = buttonWith(modal, 'md-outlined-button', 'Secondary')!;
    const primary = buttonWith(modal, 'md-filled-button', 'Primary')!;
    expect(tertiary.getBoundingClientRect().right).toBeLessThanOrEqual(
      cancel.getBoundingClientRect().left,
    );
    expect(cancel.getBoundingClientRect().right).toBeLessThanOrEqual(
      secondary.getBoundingClientRect().left,
    );
    expect(secondary.getBoundingClientRect().right).toBeLessThanOrEqual(
      primary.getBoundingClientRect().left,
    );

    const closed = whenClosed(modal);
    secondary.click();
    await closed;
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('secondary');
  });

  it('closes from the tertiary button and keeps the checkbox open', async () => {
    const modal = await setup();
    modal.showTertiaryAction = true;
    await modal.show();
    const closed = whenClosed(modal);
    buttonWith(modal, 'md-text-button', 'Tertiary')!.click();
    await closed;
    expect(modal.returnValue).toBe('tertiary');
    expect(modal.open).toBeFalse();

    modal.tertiary = 'checkbox';
    modal.returnValue = '';
    await modal.show();
    const label = modal.querySelector('[slot="tertiary"]') as HTMLElement;
    label.click();
    await modal.updateComplete;
    const checkbox = modal.shadowRoot!.querySelector('md-checkbox') as HTMLElement & {
      checked: boolean;
    };
    expect(checkbox.checked).toBeTrue();
    expect(modal.open).toBeTrue();
  });

  it('walks pages and ignores the action switches', async () => {
    const modal = await setup();
    modal.type = 'walkthrough';
    modal.showCancel = true;
    modal.showSecondaryAction = true;
    modal.showTertiaryAction = true;
    await modal.show();
    expect(modal.shadowRoot!.querySelector('.default-actions')).toBeNull();
    expect(modal.shadowRoot!.querySelector('.nav.prev')!.hasAttribute('hidden')).toBeTrue();
    const pages = [...modal.querySelectorAll('section')];
    expect(pages[0].hasAttribute('data-current')).toBeTrue();

    const container = modal.shadowRoot!.querySelector('.container')!;
    container.dispatchEvent(new PointerEvent('pointerdown', {clientX: 200, clientY: 20, bubbles: true}));
    container.dispatchEvent(new PointerEvent('pointerup', {clientX: 100, clientY: 20, bubbles: true}));
    await modal.updateComplete;
    expect(pages[1].hasAttribute('data-current')).toBeTrue();
    expect(modal.shadowRoot!.querySelector('.nav.prev')!.hasAttribute('hidden')).toBeFalse();

    (modal.shadowRoot!.querySelectorAll('.dot')[3] as HTMLElement).click();
    await modal.updateComplete;
    expect(pages[3].hasAttribute('data-current')).toBeTrue();
    const nextIcon = modal.querySelector('[slot="next"] md-icon')!;
    expect(nextIcon.textContent?.trim()).toBe('arrow_forward');
    expect(modal.shadowRoot!.querySelector('.navs md-filled-icon-button')).toBeNull();
    expect(modal.shadowRoot!.querySelector('.navs md-outlined-icon-button')).toBeNull();

    const closed = whenClosed(modal);
    (modal.querySelector('[slot="next"]') as HTMLElement).click();
    await closed;
    expect(modal.open).toBeFalse();
    expect(modal.returnValue).toBe('done');

    await modal.show();
    await modal.updateComplete;
    expect(pages[0].hasAttribute('data-current')).toBeTrue();
    expect(modal.shadowRoot!.querySelector('.nav.prev')!.hasAttribute('hidden')).toBeTrue();
    expect(nextIcon.textContent?.trim()).toBe('arrow_forward');
  });

  it('uses an arrow then a check when next is not slotted', async () => {
    const modal = await setup();
    modal.querySelector('[slot="next"]')!.remove();
    modal.type = 'walkthrough';
    await modal.updateComplete;
    await modal.show();
    const builtin = () =>
      modal.shadowRoot!.querySelector('.navs .nav:last-child md-filled-icon-button md-icon')!;
    expect(builtin().textContent?.trim()).toBe('arrow_forward');
    expect(modal.shadowRoot!.querySelector('.nav.prev md-outlined-icon-button')).toBeNull();
    (modal.shadowRoot!.querySelectorAll('.dot')[3] as HTMLElement).click();
    await modal.updateComplete;
    expect(builtin().textContent?.trim()).toBe('check');
    expect(modal.querySelector('[slot="next"]')).toBeNull();
  });

  it('shows a back button from the second page when previous is not slotted', async () => {
    const modal = await setup();
    modal.querySelector('[slot="previous"]')!.remove();
    modal.type = 'walkthrough';
    await modal.updateComplete;
    await modal.show();
    const prev = modal.shadowRoot!.querySelector('.nav.prev')!;
    expect(prev.hasAttribute('hidden')).toBeTrue();
    (modal.querySelector('[slot="next"]') as HTMLElement).click();
    await modal.updateComplete;
    expect(prev.hasAttribute('hidden')).toBeFalse();
    expect(prev.querySelector('md-outlined-icon-button md-icon')!.textContent?.trim()).toBe(
      'arrow_back',
    );
    expect(modal.querySelector('[slot="previous"]')).toBeNull();
    expect(modal.querySelector('[slot="next"] md-icon')!.textContent?.trim()).toBe(
      'arrow_forward',
    );
  });

  it('keeps the same hero while paging', async () => {
    const modal = await setup();
    modal.type = 'walkthrough';
    await modal.show();
    const hero = modal.querySelector('[slot="hero"]')!;
    (modal.querySelector('[slot="next"]') as HTMLElement).click();
    await modal.updateComplete;
    expect(modal.querySelector('[slot="hero"]')).toBe(hero);
  });

  it('writes close for the close button', async () => {
    const modal = await setup();
    await modal.show();
    const closed = whenClosed(modal);
    (modal.shadowRoot!.querySelector('.close') as HTMLElement).click();
    await closed;
    expect(modal.returnValue).toBe('close');
    expect(modal.open).toBeFalse();
  });
});

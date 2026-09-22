/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {createTokenTests} from '../../testing/tokens.js';

import {MdFilledCard} from './filled-card.js';

describe('<md-filled-card>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(MdFilledCard.styles);
  });

  it('pads content from the side edges and aligns text to the start', async () => {
    const root = env.render(html`
      <md-filled-card>
        <div slot="content">Title</div>
      </md-filled-card>
    `);
    await env.waitForStability();
    const content = root.querySelector<HTMLElement>('[slot="content"]');
    const style = getComputedStyle(content!);

    expect(style.paddingInlineStart).toBe('16px');
    expect(style.paddingInlineEnd).toBe('16px');
    expect(style.textAlign).toBe('start');
  });

  it('links media and content while leaving actions outside the link', async () => {
    const root = env.render(html`
      <md-filled-card href="/detail">
        <div class="media"></div>
        <div slot="content">Title</div>
        <button slot="action">Save</button>
      </md-filled-card>
    `);
    await env.waitForStability();
    const card = root.querySelector('md-filled-card')!;
    const link = card.renderRoot.querySelector('a');
    const action = root.querySelector('button')!;
    const actionSlot = card.renderRoot.querySelector<HTMLSlotElement>(
      'slot[name="action"]',
    );

    expect(link?.getAttribute('href')).toBe('/detail');
    expect(actionSlot?.assignedElements()).toContain(action);
    expect(link?.contains(actionSlot!)).toBeFalse();
  });

  it('does not follow the primary link when disabled', async () => {
    const root = env.render(html`
      <md-filled-card href="/detail" disabled></md-filled-card>
    `);
    await env.waitForStability();
    const card = root.querySelector('md-filled-card')!;
    const link = card.renderRoot.querySelector('a')!;
    const event = new MouseEvent('click', {bubbles: true, cancelable: true});

    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(link.getAttribute('aria-disabled')).toBe('true');
  });
});

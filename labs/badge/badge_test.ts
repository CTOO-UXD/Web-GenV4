/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// import 'jasmine'; (google3-only)

import {html} from 'lit';

import {Environment} from '../../testing/environment.js';
import {createTokenTests} from '../../testing/tokens.js';

import {MdBadge} from './badge.js';

describe('<md-badge>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(MdBadge.styles);
  });

  it('shows a 6 by 6 dot when value is empty', async () => {
    const root = env.render(html`<md-badge value=""></md-badge>`);
    await env.waitForStability();
    const badge = root.querySelector('md-badge');
    const box = badge?.renderRoot.querySelector('div');

    expect(box).not.toBeNull();
    expect(box?.textContent?.trim()).toBe('');
    expect(box?.getBoundingClientRect().width).toBe(6);
    expect(box?.getBoundingClientRect().height).toBe(6);
  });

  it('shows the value in a 16 by 16 badge', async () => {
    const root = env.render(html`<md-badge value="3"></md-badge>`);
    await env.waitForStability();
    const badge = root.querySelector('md-badge');
    const box = badge?.renderRoot.querySelector('div');

    expect(box?.textContent?.trim()).toBe('3');
    expect(box?.getBoundingClientRect().width).toBe(16);
    expect(box?.getBoundingClientRect().height).toBe(16);
  });

  it('caps numeric values above 999 at 999+ within 34px', async () => {
    const root = env.render(html`<md-badge value="1000"></md-badge>`);
    await env.waitForStability();
    const badge = root.querySelector('md-badge');
    const box = badge?.renderRoot.querySelector('div');

    expect(box?.textContent?.trim()).toBe('999+');
    expect(box?.getBoundingClientRect().width).toBeLessThanOrEqual(34);
    expect(box?.getBoundingClientRect().height).toBe(16);
  });

  it('truncates labels longer than four characters', async () => {
    const root = env.render(html`<md-badge value="abcde"></md-badge>`);
    await env.waitForStability();
    const badge = root.querySelector('md-badge');
    const box = badge?.renderRoot.querySelector('div');

    expect(box?.textContent?.trim()).toBe('abc+');
  });
});

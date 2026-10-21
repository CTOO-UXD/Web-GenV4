/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import '../button/filled-button.js';
import '../button/outlined-button.js';
import '../checkbox/checkbox.js';
import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdAlertBanner} from './alert-banner.js';

const INK = 'rgb(14, 19, 30)';
describe('<md-alert-banner>', () => {
  const env = new Environment();

  async function setup(template = html`
    <md-alert-banner label="标题" supporting-text="正文"></md-alert-banner>
  `) {
    const root = env.render(template);
    await env.waitForStability();
    const banners = [...root.querySelectorAll('md-alert-banner')];
    await Promise.all(
      banners.map(async (banner) => {
        await banner.updateComplete;
        await banner.updateComplete;
      }),
    );
    return {root, banner: banners[0], banners};
  }

  function mark(banner: MdAlertBanner) {
    return banner.shadowRoot!.querySelector<HTMLElement>('.mark')!;
  }

  function icon(banner: MdAlertBanner) {
    return mark(banner).querySelector('md-icon')!;
  }

  function closeButton(banner: MdAlertBanner) {
    return banner.shadowRoot!.querySelector<HTMLElement>('.close')!;
  }

  describe('tokens', () => {
    createTokenTests(MdAlertBanner.styles);
  });

  it('defaults to an unshadowed default scheme with status', async () => {
    const {banner} = await setup();

    expect(banner.scheme).toBe('default');
    expect(banner.elevated).toBeFalse();
    expect(banner.getAttribute('role')).toBe('status');
    expect(getComputedStyle(banner).boxShadow).toBe('none');
    expect(mark(banner).getAttribute('aria-hidden')).toBe('true');
    expect(closeButton(banner).getAttribute('aria-label')).toBe('关闭');
    expect(closeButton(banner).textContent).toContain('close');
  });

  it('uses alert for error and follows scheme', async () => {
    const {banner} = await setup(html`
      <md-alert-banner scheme="error" label="出错"></md-alert-banner>
    `);

    expect(banner.getAttribute('role')).toBe('alert');
    banner.scheme = 'warning';
    await banner.updateComplete;
    expect(banner.getAttribute('role')).toBe('status');
    banner.scheme = 'error';
    await banner.updateComplete;
    expect(banner.getAttribute('role')).toBe('alert');
  });

  it('omits an empty title or supporting line', async () => {
    const titleOnly = await setup(html`
      <md-alert-banner label="只有标题"></md-alert-banner>
    `);
    expect(titleOnly.banner.shadowRoot!.querySelector('.label')).not.toBeNull();
    expect(titleOnly.banner.shadowRoot!.querySelector('.supporting')).toBeNull();

    const textOnly = await setup(html`
      <md-alert-banner supporting-text="只有正文"></md-alert-banner>
    `);
    expect(textOnly.banner.shadowRoot!.querySelector('.label')).toBeNull();
    expect(
      textOnly.banner.shadowRoot!.querySelector('.supporting'),
    ).not.toBeNull();
  });

  it('uses the scheme ligature until icon replaces it', async () => {
    const {banners} = await setup(html`
      <div>
        <md-alert-banner label="a"></md-alert-banner>
        <md-alert-banner scheme="informational" label="b"></md-alert-banner>
        <md-alert-banner scheme="success" label="c"></md-alert-banner>
        <md-alert-banner scheme="warning" label="d"></md-alert-banner>
        <md-alert-banner scheme="error" label="e"></md-alert-banner>
      </div>
    `);

    expect(banners.map((banner) => icon(banner).textContent?.trim())).toEqual([
      'campaign',
      'info',
      'check_circle',
      'warning',
      'error',
    ]);

    banners[2].icon = 'mail';
    await banners[2].updateComplete;
    expect(icon(banners[2]).textContent?.trim()).toBe('mail');
  });

  it('gives empty actions and checkbox no box', async () => {
    const {banner} = await setup();
    const actions = banner.shadowRoot!.querySelector<HTMLElement>('.actions')!;
    const check = banner.shadowRoot!.querySelector<HTMLElement>('.check')!;

    const side = banner.shadowRoot!.querySelector<HTMLElement>('.side')!;

    expect(actions.hasAttribute('hidden')).toBeTrue();
    expect(check.hasAttribute('hidden')).toBeTrue();
    expect(side.hasAttribute('hidden')).toBeTrue();
    expect(actions.getBoundingClientRect().height).toBe(0);
    expect(check.getBoundingClientRect().height).toBe(0);
    expect(side.getBoundingClientRect().width).toBe(0);
  });

  it('shows slotted actions and a checkbox', async () => {
    const {banner} = await setup(html`
      <md-alert-banner label="标题">
        <span slot="checkbox"><md-checkbox></md-checkbox>下次不再显示</span>
        <md-filled-button slot="actions">确定</md-filled-button>
      </md-alert-banner>
    `);

    expect(
      banner.shadowRoot!.querySelector('.actions')!.hasAttribute('hidden'),
    ).toBeFalse();
    expect(
      banner.shadowRoot!.querySelector('.check')!.hasAttribute('hidden'),
    ).toBeFalse();
    expect(banner.querySelector('md-checkbox')).not.toBeNull();
  });

  it('closes without leaving the document, then shows again', async () => {
    const {root, banners} = await setup(html`
      <div style="display: flex; flex-direction: column;">
        <md-alert-banner label="上"></md-alert-banner>
        <md-alert-banner label="下"></md-alert-banner>
      </div>
    `);
    const [top, bottom] = banners;
    const before = bottom.getBoundingClientRect().top;
    let closed = 0;
    top.addEventListener('close', () => {
      closed += 1;
    });

    closeButton(top).click();

    expect(closed).toBe(1);
    expect(top.hasAttribute('hidden')).toBeTrue();
    expect(top.getBoundingClientRect().height).toBe(0);
    expect(root.contains(top)).toBeTrue();
    expect(bottom.getBoundingClientRect().top).toBeLessThan(before);

    top.hidden = false;
    await top.updateComplete;
    expect(top.hasAttribute('hidden')).toBeFalse();
    expect(top.getBoundingClientRect().height).toBeGreaterThan(0);
  });

  it('adds the elevation shadow only when elevated', async () => {
    const {banner} = await setup(html`
      <md-alert-banner elevated label="阴影"></md-alert-banner>
    `);
    const shadow = getComputedStyle(banner).boxShadow;

    expect(banner.elevated).toBeTrue();
    expect(shadow).not.toBe('none');
    expect(shadow).toContain('0.3');
    expect(shadow).toContain('0.12');
  });

  it('keeps a 740px box when the parent is narrower', async () => {
    const {banner} = await setup(html`
      <div style="display: flex; width: 200px;">
        <md-alert-banner label="窄"></md-alert-banner>
      </div>
    `);

    expect(banner.getBoundingClientRect().width).toBe(740);
    expect(getComputedStyle(banner).flexShrink).toBe('0');
  });

  it('sizes the banner, icon, copy, and buttons from the spec', async () => {
    const {banner} = await setup(html`
      <md-alert-banner label="标题" supporting-text="正文">
        <span slot="checkbox"><md-checkbox></md-checkbox>下次不再显示</span>
        <md-filled-button slot="actions">确定</md-filled-button>
        <md-outlined-button slot="actions">取消</md-outlined-button>
      </md-alert-banner>
    `);
    const style = getComputedStyle(banner);
    const glyph = icon(banner).getBoundingClientRect();
    const well = mark(banner).getBoundingClientRect();
    const host = banner.getBoundingClientRect();
    const middle = banner.shadowRoot!.querySelector('.middle')!.getBoundingClientRect();
    const copy = banner.shadowRoot!.querySelector<HTMLElement>('.copy')!;
    const check = banner.shadowRoot!.querySelector('.check')!.getBoundingClientRect();
    const actions = banner.shadowRoot!.querySelector<HTMLElement>('.actions')!;
    const filled = banner.querySelector('md-filled-button')!;
    const outlined = banner.querySelector('md-outlined-button')!;
    const close = closeButton(banner).getBoundingClientRect();
    const label = getComputedStyle(banner.shadowRoot!.querySelector('.label')!);
    const supporting = getComputedStyle(
      banner.shadowRoot!.querySelector('.supporting')!,
    );

    expect(host.width).toBe(740);
    expect(style.paddingTop).toBe('12px');
    expect(style.paddingLeft).toBe('12px');
    expect(style.borderRadius).toBe('16px');
    expect(Math.round(middle.left - well.right)).toBe(12);
    expect(Math.round(close.left - middle.right)).toBe(12);
    expect(host.height).toBe(72);
    expect(well.width).toBe(32);
    expect(well.height).toBe(32);
    expect(getComputedStyle(mark(banner)).borderRadius).toBe('999px');
    expect(glyph.width).toBe(16);
    expect(glyph.height).toBe(16);
    const closeIcon = closeButton(banner).querySelector('md-icon')!;

    expect(close.width).toBe(32);
    expect(close.height).toBe(32);
    expect(getComputedStyle(closeIcon).width).toBe('16px');
    expect(getComputedStyle(closeIcon).height).toBe('16px');
    expect(getComputedStyle(closeIcon).width).toBe('16px');
    expect(getComputedStyle(closeIcon).height).toBe('16px');
    expect(Math.round(well.top - host.top)).toBe(20);
    expect(Math.round(close.top - host.top)).toBe(20);
    expect(getComputedStyle(copy).minWidth).toBe('268px');
    expect(Math.round(check.left - copy.getBoundingClientRect().right)).toBe(16);
    expect(
      Math.round(
        outlined.getBoundingClientRect().left -
          filled.getBoundingClientRect().right,
      ),
    ).toBe(6);
    expect(filled.getBoundingClientRect().height).toBe(32);
    expect(outlined.getBoundingClientRect().height).toBe(32);
    expect(getComputedStyle(actions).paddingTop).toBe('8px');
    expect(getComputedStyle(filled).paddingLeft).toBe('16px');
    expect(getComputedStyle(filled).fontSize).toBe('12px');
    expect(getComputedStyle(filled).lineHeight).toBe('16px');
    expect(getComputedStyle(filled).fontWeight).toBe('600');
    expect(label.fontSize).toBe('14px');
    expect(label.lineHeight).toBe('20px');
    expect(label.fontWeight).toBe('600');
    expect(label.letterSpacing).toBe('0.25px');
    expect(label.whiteSpace).toBe('nowrap');
    expect(supporting.fontWeight).toBe('400');
    expect(supporting.whiteSpace).not.toBe('nowrap');
  });

  it('is 72px tall for one line and centers copy on the icon', async () => {
    const {banners} = await setup(html`
      <div>
        <md-alert-banner label="只有标题"></md-alert-banner>
        <md-alert-banner supporting-text="只有正文"></md-alert-banner>
        <md-alert-banner label="标题" supporting-text="正文"></md-alert-banner>
      </div>
    `);
    const center = (rect: DOMRect) => rect.top + rect.height / 2;

    for (const banner of banners) {
      const host = banner.getBoundingClientRect();
      const well = mark(banner).getBoundingClientRect();
      const glyph = icon(banner).getBoundingClientRect();
      const close = closeButton(banner).getBoundingClientRect();
      const copy = banner
        .shadowRoot!.querySelector('.copy')!
        .getBoundingClientRect();

      expect(getComputedStyle(banner).boxSizing).toBe('border-box');
      expect(host.height).toBe(72);
      expect(well.width).toBe(32);
      expect(well.height).toBe(32);
      expect(Math.round(well.top - host.top)).toBe(20);
      expect(center(glyph)).toBeCloseTo(center(well), 0);
      expect(center(copy)).toBeCloseTo(center(well), 0);
      expect(center(close)).toBeCloseTo(center(well), 0);
    }
  });

  it('sets slotted checkbox text to 12px on 16px', async () => {
    const {banner} = await setup(html`
      <md-alert-banner label="标题">
        <span slot="checkbox"><md-checkbox></md-checkbox>下次不再显示</span>
      </md-alert-banner>
    `);
    const text = getComputedStyle(banner.querySelector('[slot="checkbox"]')!);

    expect(text.fontSize).toBe('12px');
    expect(text.lineHeight).toBe('16px');
    expect(text.letterSpacing).toBe('0.1px');
  });

  it('paints each scheme, including buttons', async () => {
    const {banners} = await setup(html`
      <div>
        <md-alert-banner label="默认">
          <md-filled-button slot="actions">确定</md-filled-button>
          <md-outlined-button slot="actions">取消</md-outlined-button>
        </md-alert-banner>
        <md-alert-banner scheme="informational" label="说明">
          <md-filled-button slot="actions">确定</md-filled-button>
          <md-outlined-button slot="actions">取消</md-outlined-button>
        </md-alert-banner>
        <md-alert-banner scheme="success" label="成功">
          <md-filled-button slot="actions">确定</md-filled-button>
          <md-outlined-button slot="actions">取消</md-outlined-button>
        </md-alert-banner>
        <md-alert-banner scheme="warning" label="警告">
          <md-filled-button slot="actions">确定</md-filled-button>
          <md-outlined-button slot="actions">取消</md-outlined-button>
        </md-alert-banner>
        <md-alert-banner scheme="error" label="错误">
          <md-filled-button slot="actions">确定</md-filled-button>
          <md-outlined-button slot="actions">取消</md-outlined-button>
        </md-alert-banner>
      </div>
    `);

    const roles: Record<string, string> = {
      surface: 'rgb(1, 2, 3)',
      'on-surface': 'rgb(4, 5, 6)',
      'surface-container': 'rgb(7, 8, 9)',
      secondary: 'rgb(10, 11, 12)',
      'secondary-container': 'rgb(13, 14, 15)',
      error: 'rgb(16, 17, 18)',
      'error-container': 'rgb(19, 20, 21)',
      primary: 'rgb(22, 23, 24)',
      'on-primary': 'rgb(25, 26, 27)',
    };

    for (const banner of banners) {
      for (const [name, value] of Object.entries(roles)) {
        banner.style.setProperty(`--md-sys-color-${name}`, value);
      }
    }

    const paint = (banner: MdAlertBanner) => {
      const filled = banner.querySelector('md-filled-button')!;
      const outlined = banner.querySelector('md-outlined-button')!;
      return {
        background: getComputedStyle(banner).backgroundColor,
        icon: getComputedStyle(icon(banner)).color,
        well: getComputedStyle(mark(banner)).backgroundColor,
        close: getComputedStyle(
          closeButton(banner).querySelector('md-icon')!,
        ).color,
        text: getComputedStyle(banner.shadowRoot!.querySelector('.label')!).color,
        filled: getComputedStyle(filled.shadowRoot!.querySelector('.background')!)
          .backgroundColor,
        filledText: getComputedStyle(filled.shadowRoot!.querySelector('.button')!)
          .color,
        outline: getComputedStyle(outlined.shadowRoot!.querySelector('.outline')!)
          .borderTopColor,
        outlineText: getComputedStyle(
          outlined.shadowRoot!.querySelector('.button')!,
        ).color,
      };
    };

    const [plain, info, success, warning, error] = banners.map(paint);

    expect(plain.background).toBe(roles['surface']);
    expect(plain.icon).toBe(roles['on-surface']);
    expect(plain.well).toBe(roles['surface-container']);
    expect(plain.close).toBe(roles['on-surface']);
    expect(plain.text).toBe(roles['on-surface']);
    expect(plain.filled).toBe(roles['primary']);
    expect(plain.filledText).toBe(roles['on-primary']);
    expect(plain.outline).toBe(INK);
    expect(plain.outlineText).toBe(INK);

    expect(info.background).toBe(roles['secondary-container']);
    expect(info.icon).toBe(roles['secondary']);
    expect(info.well).toBe(roles['surface']);
    expect(info.close).toBe(INK);
    expect(info.filled).toBe(INK);
    expect(info.text).toBe(roles['on-surface']);
    expect(info.filledText).toBe(roles['on-primary']);
    expect(info.outline).toBe(INK);
    expect(info.outlineText).toBe(INK);

    expect(success.background).toBe('rgb(168, 245, 166)');
    expect(success.icon).toBe('rgb(62, 134, 67)');
    expect(success.well).toBe(roles['surface']);
    expect(success.close).toBe(INK);
    expect(success.filled).toBe(INK);
    expect(success.text).toBe(roles['on-surface']);
    expect(success.filledText).toBe(roles['on-primary']);
    expect(success.outline).toBe(INK);
    expect(success.outlineText).toBe(INK);

    expect(warning.background).toBe('rgb(255, 222, 170)');
    expect(warning.icon).toBe('rgb(156, 110, 3)');
    expect(warning.well).toBe(roles['surface']);
    expect(warning.close).toBe(INK);
    expect(warning.filled).toBe(INK);
    expect(warning.text).toBe(roles['on-surface']);
    expect(warning.filledText).toBe(roles['on-primary']);
    expect(warning.outline).toBe(INK);
    expect(warning.outlineText).toBe(INK);

    expect(error.background).toBe(roles['error-container']);
    expect(error.icon).toBe(roles['error']);
    expect(error.well).toBe(roles['surface']);
    expect(error.close).toBe(INK);
    expect(error.text).toBe(roles['on-surface']);
    expect(error.filled).toBe(INK);
    expect(error.filledText).toBe(roles['on-primary']);
    expect(error.outline).toBe(INK);
    expect(error.outlineText).toBe(INK);
  });
});

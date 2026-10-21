/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html, render} from 'lit';

import {createTokenTests} from '../testing/tokens.js';

import {MdGenMenu} from './gen-menu.js';
import {MdGenMenuGroup} from './gen-menu-group.js';
import {MdGenMenuItem} from './gen-menu-item.js';

function rgb(hex: string) {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgb(${red}, ${green}, ${blue})`;
}

async function paint(root: HTMLElement, template: ReturnType<typeof html>) {
  render(template, root);
  const elements = root.querySelectorAll<MdGenMenu | MdGenMenuGroup | MdGenMenuItem>(
    'md-gen-menu, md-gen-menu-group, md-gen-menu-item',
  );
  await Promise.all(Array.from(elements, (element) => element.updateComplete));
}

async function openMenu(menu: MdGenMenu) {
  const opened = new Promise((resolve) =>
    menu.addEventListener('opened', resolve, {once: true}),
  );
  menu.show();
  await opened;
  await menu.updateComplete;
}

describe('gen menu', () => {
  describe('tokens', () => {
    createTokenTests(MdGenMenu.styles);
    createTokenTests(MdGenMenuGroup.styles);
    createTokenTests(MdGenMenuItem.styles);
  });

  let root: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('reflects theme and keeps the old menu defaults', async () => {
    await paint(root, html`<md-gen-menu></md-gen-menu>`);
    const menu = root.querySelector('md-gen-menu')!;
    expect(menu.theme).toBe('standard');
    expect(menu.getAttribute('theme')).toBe('standard');
    menu.theme = 'vibrant';
    await menu.updateComplete;
    expect(menu.getAttribute('theme')).toBe('vibrant');
    expect(menu.positioning).toBe('absolute');
    expect(menu.anchorCorner).toBe('end-start');
    expect(menu.menuCorner).toBe('start-start');
    expect(menu.defaultFocus).toBe('first-item');
    expect(menu.typeaheadDelay).toBe(200);
    expect(menu.quick).toBe(false);
    expect(menu.hasOverflow).toBe(false);
    expect(menu.open).toBe(false);
  });

  it('opens and closes', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu anchor="anchor" quick>
          <md-gen-menu-item>One</md-gen-menu-item>
        </md-gen-menu>
      `,
    );
    const menu = root.querySelector('md-gen-menu')!;
    const opened = new Promise((resolve) =>
      menu.addEventListener('opened', resolve, {once: true}),
    );
    menu.show();
    await opened;
    expect(menu.open).toBe(true);
    const closed = new Promise((resolve) =>
      menu.addEventListener('closed', resolve, {once: true}),
    );
    menu.close();
    await closed;
    expect(menu.open).toBe(false);
  });

  it('focuses the menu list when default-focus is list-root', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu anchor="anchor" quick default-focus="list-root">
          <md-gen-menu-item>One</md-gen-menu-item>
        </md-gen-menu>
      `,
    );
    const menu = root.querySelector('md-gen-menu')!;
    await openMenu(menu);
    const list = menu.shadowRoot!.querySelector('.items');
    expect(menu.shadowRoot!.activeElement).toBe(list);
    expect(document.activeElement).toBe(menu);
  });

  it('closes on item click unless keep-open, including items in a group', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu anchor="anchor" quick>
          <md-gen-menu-group>
            <md-gen-menu-item id="close">Close</md-gen-menu-item>
            <md-gen-menu-item id="stay" keep-open>Stay</md-gen-menu-item>
          </md-gen-menu-group>
        </md-gen-menu>
      `,
    );
    const menu = root.querySelector('md-gen-menu')!;
    const opened = new Promise((resolve) =>
      menu.addEventListener('opened', resolve, {once: true}),
    );
    menu.show();
    await opened;
    root.querySelector<HTMLElement>('#stay')!.click();
    expect(menu.open).toBe(true);
    root.querySelector<HTMLElement>('#close')!.click();
    expect(menu.open).toBe(false);
  });

  it('moves across groups, skips disabled, and does not write selected', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu anchor="anchor" quick default-focus="none">
          <md-gen-menu-group>
            <md-gen-menu-item id="a" selected>A</md-gen-menu-item>
            <md-gen-menu-item id="b" disabled>B</md-gen-menu-item>
          </md-gen-menu-group>
          <md-gen-menu-group>
            <md-gen-menu-item id="c">C</md-gen-menu-item>
          </md-gen-menu-group>
        </md-gen-menu>
      `,
    );
    const menu = root.querySelector('md-gen-menu')!;
    await openMenu(menu);
    const a = root.querySelector<MdGenMenuItem>('#a')!;
    const b = root.querySelector<MdGenMenuItem>('#b')!;
    const c = root.querySelector<MdGenMenuItem>('#c')!;
    a.focus();
    a.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        bubbles: true,
      }),
    );
    expect(document.activeElement).toBe(c);
    expect(c.tabIndex).toBe(0);
    expect(a.tabIndex).toBe(-1);
    expect(a.selected).toBe(true);
    expect(b.selected).toBe(false);
    expect(c.selected).toBe(false);
    const closed = new Promise((resolve) =>
      menu.addEventListener('closed', resolve, {once: true}),
    );
    menu.close();
    await closed;
    expect(a.selected).toBe(true);
    expect(b.selected).toBe(false);
    expect(c.selected).toBe(false);
  });

  it('keeps a fixed width and stays transparent with one menu shadow', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu id="menu" anchor="anchor" quick>
          <md-gen-menu-item>
            这是一段长得足以把卡片撑开的文字如果宽度没有被固定住
          </md-gen-menu-item>
          <md-gen-menu-group id="group">
            <md-gen-menu-item>Short</md-gen-menu-item>
          </md-gen-menu-group>
        </md-gen-menu>
      `,
    );
    const menu = root.querySelector<MdGenMenu>('#menu')!;
    await openMenu(menu);
    const surface = menu.shadowRoot!.querySelector('.menu') as HTMLElement;
    expect(Math.round(surface.getBoundingClientRect().width)).toBe(208);
    expect(getComputedStyle(surface).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(surface).filter).toContain('drop-shadow');
    const group = root.querySelector('#group')!;
    expect(getComputedStyle(group).boxShadow).toBe('none');
    menu.style.setProperty('--md-gen-menu-width', '320px');
    expect(Math.round(surface.getBoundingClientRect().width)).toBe(320);
  });

  it('draws one card for items placed directly in the menu', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu anchor="anchor" quick>
          <md-gen-menu-item>Only</md-gen-menu-item>
        </md-gen-menu>
      `,
    );
    const menu = root.querySelector('md-gen-menu')!;
    await openMenu(menu);
    const card = menu.shadowRoot!.querySelector('.items') as HTMLElement;
    const cardStyle = getComputedStyle(card);
    expect(cardStyle.backgroundColor).toBe(rgb('#fbf9f7'));
    expect(cardStyle.borderRadius).toBe('16px');
    expect(cardStyle.paddingTop).toBe('2px');
    expect(cardStyle.paddingLeft).toBe('0px');
  });

  it('spaces groups by 2px and paints theme colors', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu id="standard" anchor="anchor" quick stay-open-on-focusout>
          <md-gen-menu-group id="first">
            <md-gen-menu-item>One</md-gen-menu-item>
          </md-gen-menu-group>
          <md-gen-menu-group id="second">
            <md-gen-menu-item>Two</md-gen-menu-item>
          </md-gen-menu-group>
        </md-gen-menu>
        <button id="vivid-anchor">Open</button>
        <md-gen-menu id="vibrant" anchor="vivid-anchor" theme="vibrant" quick>
          <md-gen-menu-group id="vivid">
            <md-gen-menu-item>One</md-gen-menu-item>
          </md-gen-menu-group>
        </md-gen-menu>
      `,
    );
    await openMenu(root.querySelector('#standard')!);
    await openMenu(root.querySelector('#vibrant')!);
    const first = root.querySelector<HTMLElement>('#first')!;
    const second = root.querySelector<HTMLElement>('#second')!;
    const gap = second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
    expect(Math.round(gap)).toBe(2);
    expect(getComputedStyle(first).backgroundColor).toBe(rgb('#fbf9f7'));
    expect(getComputedStyle(first).borderRadius).toBe('16px');
    expect(getComputedStyle(first).paddingTop).toBe('2px');
    expect(getComputedStyle(first).paddingLeft).toBe('0px');
    expect(getComputedStyle(root.querySelector('#vivid')!).backgroundColor).toBe(
      rgb('#ffdad8'),
    );
  });

  it('styles an item and does not change selected on click', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu anchor="anchor" quick stay-open-on-focusout>
          <md-gen-menu-item id="plain">Label</md-gen-menu-item>
          <md-gen-menu-item id="picked" selected>Picked</md-gen-menu-item>
          <md-gen-menu-item id="off" disabled>Off</md-gen-menu-item>
          <md-gen-menu-item id="link" type="link" href="https://example.com">
            Link
          </md-gen-menu-item>
          <md-gen-menu-item id="button" type="button">Button</md-gen-menu-item>
          <md-gen-menu-item id="option" type="option" selected>Option</md-gen-menu-item>
        </md-gen-menu>
        <button id="vivid-anchor">Open</button>
        <md-gen-menu anchor="vivid-anchor" theme="vibrant" quick>
          <md-gen-menu-item id="vivid">Vivid</md-gen-menu-item>
          <md-gen-menu-item id="vivid-picked" selected>Vivid picked</md-gen-menu-item>
        </md-gen-menu>
      `,
    );
    await openMenu(root.querySelector('md-gen-menu')!);
    await openMenu(root.querySelectorAll('md-gen-menu')[1]);
    const plain = root.querySelector<MdGenMenuItem>('#plain')!;
    const row = plain.shadowRoot!.querySelector('.row') as HTMLElement;
    const rowStyle = getComputedStyle(row);
    expect(plain.offsetHeight).toBe(48);
    expect(row.offsetHeight).toBe(44);
    expect(rowStyle.paddingLeft).toBe('12px');
    expect(getComputedStyle(plain).paddingLeft).toBe('4px');
    expect(rowStyle.columnGap).toBe('8px');
    expect(rowStyle.fontSize).toBe('14px');
    expect(rowStyle.lineHeight).toBe('20px');
    expect(rowStyle.fontWeight).toBe('500');
    expect(rowStyle.letterSpacing).toBe('0.1px');
    expect(rowStyle.borderRadius).toBe('4px');
    expect(rowStyle.color).toBe(rgb('#1c1b1b'));
    expect(rowStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    const picked = root.querySelector<MdGenMenuItem>('#picked')!;
    const pickedRow = picked.shadowRoot!.querySelector('.row') as HTMLElement;
    expect(getComputedStyle(pickedRow).borderRadius).toBe('12px');
    expect(getComputedStyle(pickedRow).backgroundColor).toBe(rgb('#e9ddff'));
    expect(getComputedStyle(pickedRow).color).toBe(rgb('#23005c'));
    const off = root.querySelector<MdGenMenuItem>('#off')!;
    expect(off.disabled).toBe(true);
    expect(off.hasAttribute('disabled')).toBe(true);
    expect(getComputedStyle(off).opacity).toBe('0.38');
    const events: Event[] = [];
    off.addEventListener('close-menu', (event) => events.push(event));
    off.click();
    expect(events).toEqual([]);
    plain.click();
    expect(plain.selected).toBe(false);
    expect(plain.getAttribute('role')).toBe('menuitem');
    expect(root.querySelector('#button')!.getAttribute('role')).toBe('menuitem');
    expect(root.querySelector('#button')!.shadowRoot!.querySelector('button')).not.toBeNull();
    const link = root.querySelector<MdGenMenuItem>('#link')!;
    expect(link.getAttribute('role')).toBe('menuitem');
    expect(link.shadowRoot!.querySelector('a')!.getAttribute('href')).toBe(
      'https://example.com',
    );
    const option = root.querySelector('#option')!;
    expect(option.getAttribute('role')).toBe('option');
    expect(option.getAttribute('aria-selected')).toBe('true');
    const itemStyle = getComputedStyle(plain);
    expect(itemStyle.getPropertyValue('--_hover-opacity').trim()).toBe('0.08');
    expect(itemStyle.getPropertyValue('--_focus-opacity').trim()).toBe('0.1');
    expect(itemStyle.getPropertyValue('--_icon-size').trim()).toBe('20px');
    const ring = getComputedStyle(row, '::after');
    expect(ring.borderTopWidth).toBe('2px');
    expect(ring.borderTopColor).toBe(rgb('#0156cf'));
    expect(ring.borderRadius).toBe('6px');
    const pickedRing = getComputedStyle(pickedRow, '::after');
    expect(pickedRing.borderRadius).toBe('14px');
    const vivid = root.querySelector('#vivid')!.shadowRoot!.querySelector('.row')!;
    expect(getComputedStyle(vivid).color).toBe(rgb('#410008'));
    const vividPicked = root
      .querySelector('#vivid-picked')!
      .shadowRoot!.querySelector('.row')!;
    expect(getComputedStyle(vividPicked).backgroundColor).toBe(rgb('#b52332'));
    expect(getComputedStyle(vividPicked).color).toBe(rgb('#ffffff'));
    picked.selected = false;
    plain.selected = true;
    await picked.updateComplete;
    await plain.updateComplete;
    expect(picked.hasAttribute('selected')).toBe(false);
    expect(plain.hasAttribute('selected')).toBe(true);
    expect(getComputedStyle(pickedRow).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(row).backgroundColor).toBe(rgb('#e9ddff'));
  });

  it('matches typeahead-text before the visible label', async () => {
    await paint(
      root,
      html`
        <button id="anchor">Open</button>
        <md-gen-menu anchor="anchor" quick default-focus="none">
          <md-gen-menu-item id="shown" typeahead-text="Zebra">Apple</md-gen-menu-item>
          <md-gen-menu-item id="other">Apricot</md-gen-menu-item>
        </md-gen-menu>
      `,
    );
    const menu = root.querySelector('md-gen-menu')!;
    await openMenu(menu);
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'z', code: 'KeyZ', bubbles: true}),
    );
    expect(document.activeElement).toBe(root.querySelector('#shown'));
  });

  it('scrolls the whole menu without narrowing items', async () => {
    const many = Array.from({length: 30}, (_, index) => index);
    await paint(
      root,
      html`
        <button id="short-anchor">Short</button>
        <md-gen-menu id="short" anchor="short-anchor" quick>
          <md-gen-menu-item id="short-item">One</md-gen-menu-item>
        </md-gen-menu>
        <button id="long-anchor">Long</button>
        <md-gen-menu id="long" anchor="long-anchor" quick stay-open-on-focusout>
          ${many.map(
            (index) =>
              html`<md-gen-menu-item id=${`item-${index}`}>Item ${index}</md-gen-menu-item>`,
          )}
        </md-gen-menu>
      `,
    );
    const long = root.querySelector<MdGenMenu>('#long')!;
    await openMenu(long);
    const short = root.querySelector<MdGenMenu>('#short')!;
    await openMenu(short);
    const items = long.shadowRoot!.querySelector('.items') as HTMLElement;
    const surface = long.shadowRoot!.querySelector('.menu') as HTMLElement;
    if (items.scrollHeight <= items.clientHeight) {
      surface.style.height = '160px';
      items.style.maxHeight = '160px';
      items.dispatchEvent(new Event('scroll'));
    }
    expect(items.scrollHeight).toBeGreaterThan(items.clientHeight);
    const bar = long.shadowRoot!.querySelector('.bar') as HTMLElement;
    expect(bar.hidden).toBe(false);
    const shortItem = root.querySelector<HTMLElement>('#short-item')!;
    const longItem = root.querySelector<HTMLElement>('#item-0')!;
    expect(longItem.offsetWidth).toBe(shortItem.offsetWidth);
  });
});

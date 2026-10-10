/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import 'genv4/button/outlined-button.js';
import 'genv4/icon/icon.js';
import 'genv4/menu/menu.js';
import 'genv4/menu/menu-item.js';
import 'genv4/textfield/filled-text-field.js';

import iconData from 'genv4-icon/icons.json';
import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';

interface IconRecord {
  name: string;
  set: 'standard' | 'ai';
  filled: boolean;
}

@customElement('icon-gallery')
export class IconGallery extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      margin-block-end: 16px;
    }

    .anchor {
      position: relative;
    }

    md-filled-text-field {
      flex: 1 1 200px;
    }

    .count {
      color: var(--md-sys-color-on-surface-variant);
      font-size: var(--catalog-body-m-font-size);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
      gap: 8px;
    }

    button.cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 12px 8px;
      border: 0;
      border-radius: 12px;
      background: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface);
      font: inherit;
      cursor: pointer;
    }

    button.cell:hover,
    button.cell:focus-visible {
      background: var(--md-sys-color-surface-container-high);
    }

    md-icon {
      font-size: 24px;
    }

    .name {
      font-size: 11px;
      line-height: 1.3;
      text-align: center;
      word-break: break-word;
    }
  `;

  @state() private icons: IconRecord[] = iconData.icons;
  @state() private query = '';
  @state() private filled = false;
  @state() private setFilter: 'all' | 'standard' | 'ai' = 'all';
  @state() private copied = '';
  @state() private fillMenuOpen = false;
  @state() private setMenuOpen = false;

  render() {
    const q = this.query.trim().toLowerCase();
    const items = this.icons.filter((icon) => {
      if (icon.filled !== this.filled) return false;
      if (this.setFilter !== 'all' && icon.set !== this.setFilter) return false;
      return !q || icon.name.toLowerCase().includes(q);
    });
    const fillLabel = this.filled ? '填充' : '描边';
    const setLabel =
      this.setFilter === 'all'
        ? '全部'
        : this.setFilter === 'standard'
          ? 'Standard'
          : 'AI';

    return html`
      <div class="toolbar">
        <md-filled-text-field
          label="搜索图标名"
          type="search"
          .value=${this.query}
          @input=${this.onQuery}>
        </md-filled-text-field>
        <span class="anchor">
          <md-outlined-button
            id="fill-anchor"
            @click=${this.toggleFillMenu}>
            ${fillLabel}
          </md-outlined-button>
          <md-menu
            anchor="fill-anchor"
            .open=${this.fillMenuOpen}
            @closed=${this.onFillMenuClosed}>
            <md-menu-item @click=${() => this.setFilled(false)}>
              <div slot="headline">描边</div>
            </md-menu-item>
            <md-menu-item @click=${() => this.setFilled(true)}>
              <div slot="headline">填充</div>
            </md-menu-item>
          </md-menu>
        </span>
        <span class="anchor">
          <md-outlined-button
            id="set-anchor"
            @click=${this.toggleSetMenu}>
            ${setLabel}
          </md-outlined-button>
          <md-menu
            anchor="set-anchor"
            .open=${this.setMenuOpen}
            @closed=${this.onSetMenuClosed}>
            <md-menu-item @click=${() => this.setSetFilter('all')}>
              <div slot="headline">全部</div>
            </md-menu-item>
            <md-menu-item @click=${() => this.setSetFilter('standard')}>
              <div slot="headline">Standard</div>
            </md-menu-item>
            <md-menu-item @click=${() => this.setSetFilter('ai')}>
              <div slot="headline">AI</div>
            </md-menu-item>
          </md-menu>
        </span>
        <span class="count">${this.copied || `${items.length} 个`}</span>
      </div>
      <div class="grid">
        ${items.map(
          (icon) => html`
            <button
              class="cell"
              type="button"
              title="复制 <md-icon>${icon.name}</md-icon>"
              @click=${() => this.copyName(icon.name)}>
              <md-icon>${icon.name}</md-icon>
              <span class="name">${icon.name}</span>
            </button>
          `,
        )}
      </div>
    `;
  }

  private onQuery(e: Event) {
    this.query = (e.target as HTMLInputElement).value;
  }

  private toggleFillMenu() {
    this.fillMenuOpen = !this.fillMenuOpen;
    this.setMenuOpen = false;
  }

  private toggleSetMenu() {
    this.setMenuOpen = !this.setMenuOpen;
    this.fillMenuOpen = false;
  }

  private onFillMenuClosed() {
    this.fillMenuOpen = false;
  }

  private onSetMenuClosed() {
    this.setMenuOpen = false;
  }

  private setFilled(filled: boolean) {
    this.filled = filled;
  }

  private setSetFilter(value: 'all' | 'standard' | 'ai') {
    this.setFilter = value;
  }

  private async copyName(name: string) {
    const snippet = `<md-icon>${name}</md-icon>`;
    await navigator.clipboard.writeText(snippet);
    this.copied = `已复制 ${snippet}`;
    window.setTimeout(() => {
      if (this.copied === `已复制 ${snippet}`) this.copied = '';
    }, 1500);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'icon-gallery': IconGallery;
  }
}

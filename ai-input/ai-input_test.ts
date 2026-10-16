/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {MdAiInput} from './ai-input.js';

function control(root: ParentNode, label: string) {
  return [...root.querySelectorAll<HTMLElement>(
    'md-icon-button, md-filled-icon-button, md-filled-tonal-icon-button',
  )].find((button) => button.getAttribute('aria-label') === label)! as HTMLElement & {
    disabled: boolean;
  };
}

function buttonFace(button: Element) {
  const face = button.shadowRoot?.querySelector('.icon-button');
  return getComputedStyle(face!, '::before');
}

function filesOf(names: string[], type: string) {
  const transfer = new DataTransfer();
  for (const name of names) {
    transfer.items.add(new File(['x'], name, {type}));
  }
  return transfer.files;
}

describe('<md-ai-input>', () => {
  const env = new Environment();

  describe('.styles', () => {
    createTokenTests(MdAiInput.styles);
  });

  async function render(template = html`<md-ai-input></md-ai-input>`) {
    const root = env.render(template);
    await env.waitForStability();
    return root.querySelector('md-ai-input')!;
  }

  it('shows the default placeholder and disclaimer', async () => {
    const input = await render();
    const field = input.renderRoot.querySelector('textarea')!;
    const disclaimer = input.renderRoot.querySelector('p')!;

    expect(field.placeholder).toBe('Ask anything or search...');
    expect(disclaimer.textContent).toBe(
      'AI can make mistakes and may not be suitable for some minors.',
    );
  });

  it('uses the provided placeholder and disclaimer', async () => {
    const input = await render(html`
      <md-ai-input placeholder="问一句" disclaimer="提示"></md-ai-input>
    `);

    expect(input.renderRoot.querySelector('textarea')!.placeholder).toBe(
      '问一句',
    );
    expect(input.renderRoot.querySelector('p')!.textContent).toBe('提示');
  });

  it('keeps typed text in value and limits the text area to 136px', async () => {
    const input = await render();
    const field = input.renderRoot.querySelector('textarea')!;

    field.value = 'hello';
    field.dispatchEvent(new Event('input'));
    await input.updateComplete;

    expect(input.value).toBe('hello');
    expect(getComputedStyle(field).maxHeight).toBe('88px');
  });

  it('grows the text by one line and scrolls after 108px', async () => {
    const input = await render();
    input.style.width = '640px';
    const field = input.renderRoot.querySelector('textarea')!;
    const line = 'Help me find travel inspiration for Italy on a budget. ';

    field.value = line;
    field.dispatchEvent(new Event('input'));
    await input.updateComplete;
    const oneLine = field.getBoundingClientRect().height;

    field.value = `${line}\n${line}`;
    field.dispatchEvent(new Event('input'));
    await input.updateComplete;
    expect(field.getBoundingClientRect().height).toBeGreaterThan(oneLine);

    field.value = Array.from({length: 12}, () => line).join('\n');
    field.dispatchEvent(new Event('input'));
    await input.updateComplete;
    const text = field.parentElement!;
    expect(text.getBoundingClientRect().height).toBe(108);
    expect(field.getBoundingClientRect().height).toBe(88);
    expect(field.scrollHeight).toBeGreaterThan(field.clientHeight);
    expect(field.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      text.getBoundingClientRect().bottom,
    );
    const add = input.renderRoot.querySelector('.add')!.getBoundingClientRect();
    expect(Math.abs(add.bottom - text.getBoundingClientRect().bottom)).toBeLessThan(2);
    expect(getComputedStyle(field, '::-webkit-scrollbar-thumb').backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
  });

  it('keeps the narrow frame at 112px with a 24px disclaimer and a 4px gap', async () => {
    const input = await render();
    input.style.width = '1200px';
    await input.updateComplete;
    expect(input.getBoundingClientRect().width).toBe(832);

    input.style.width = '374px';
    await input.updateComplete;

    const frame = input.renderRoot.querySelector('.frame')!;
    const disclaimer = input.renderRoot.querySelector('p')!;
    const send = control(input.renderRoot, '发送');
    const frameBox = frame.getBoundingClientRect();
    const disclaimerBox = disclaimer.getBoundingClientRect();
    const sendBox = send.getBoundingClientRect();

    expect(frameBox.height).toBe(112);
    expect(disclaimerBox.height).toBe(24);
    expect(Math.round(disclaimerBox.top - frameBox.bottom)).toBe(4);
    expect(sendBox.width).toBe(40);
    expect(sendBox.height).toBe(40);
    expect(sendBox.right).toBeLessThanOrEqual(frameBox.right);
    expect(sendBox.bottom).toBeLessThanOrEqual(frameBox.bottom);
    expect(sendBox.top).toBeGreaterThan(
      input.renderRoot.querySelector('textarea')!.getBoundingClientRect().bottom,
    );
  });

  it('puts actions on the next row below 560px and on one row at 560px', async () => {
    const input = await render();
    const field = () => input.renderRoot.querySelector('textarea')!;
    const send = () => control(input.renderRoot, '发送');

    input.style.width = '400px';
    await input.updateComplete;
    expect(send().getBoundingClientRect().top).toBeGreaterThan(
      field().getBoundingClientRect().bottom - 1,
    );

    input.style.width = '640px';
    await input.updateComplete;
    expect(send().getBoundingClientRect().top).toBeLessThan(
      field().getBoundingClientRect().bottom,
    );
  });

  it('shows clear only when there is text and clears text only', async () => {
    const input = await render();
    const picker = input.renderRoot.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )!;
    picker.files = filesOf(['notes.txt'], 'text/plain');
    picker.dispatchEvent(new Event('change'));
    await input.updateComplete;

    expect(input.renderRoot.querySelector('[aria-label="清除"]')).toBeNull();

    input.value = 'hello';
    await input.updateComplete;
    control(input.renderRoot, '清除').click();
    await input.updateComplete;

    expect(input.value).toBe('');
    expect(input.files.map((file) => file.name)).toEqual(['notes.txt']);
    expect(input.renderRoot.querySelector('md-filled-tonal-icon-button')).toBeNull();
  });

  it('emits send without clearing and emits interrupt while thinking', async () => {
    const input = await render();
    const sent: Array<{value: string}> = [];
    const interrupts: Event[] = [];
    input.addEventListener('send', ((event: CustomEvent<{value: string}>) => {
      sent.push(event.detail);
    }) as EventListener);
    input.addEventListener('interrupt', (event) => {
      interrupts.push(event);
    });

    control(input.renderRoot, '发送').click();
    expect(sent.length).toBe(0);
    expect(input.thinking).toBeFalse();

    input.value = '   ';
    await input.updateComplete;
    expect(input.renderRoot.querySelector('[aria-label="清除"]')).toBeNull();
    expect(control(input.renderRoot, '发送').disabled).toBeTrue();
    control(input.renderRoot, '发送').click();
    expect(sent.length).toBe(0);

    input.value = 'hello';
    await input.updateComplete;
    expect(control(input.renderRoot, '发送').disabled).toBeFalse();
    control(input.renderRoot, '发送').click();

    expect(sent.map((detail) => detail.value)).toEqual(['hello']);
    expect(input.value).toBe('hello');
    expect(input.thinking).toBeTrue();
    await input.updateComplete;

    const clear = control(input.renderRoot, '清除');
    expect(clear.disabled).toBeTrue();
    clear.click();
    await input.updateComplete;
    expect(input.value).toBe('hello');

    for (const width of ['374px', '640px']) {
      input.style.width = width;
      await input.updateComplete;
      const field = input.renderRoot.querySelector('textarea')!;
      expect(field.readOnly).toBeTrue();
      field.value = 'changed';
      field.dispatchEvent(new Event('input'));
      await input.updateComplete;
      expect(input.value).toBe('hello');
      expect(field.value).toBe('hello');
      expect(control(input.renderRoot, '清除').disabled).toBeTrue();
      expect(control(input.renderRoot, '停止')).not.toBeUndefined();
    }

    control(input.renderRoot, '听写').click();
    await input.updateComplete;
    expect(input.listening).toBeTrue();
    expect(control(input.renderRoot, '停止').disabled).toBeFalse();

    control(input.renderRoot, '停止').click();
    await input.updateComplete;

    expect(interrupts.length).toBe(1);
    expect(sent.length).toBe(1);
    expect(input.thinking).toBeFalse();
    expect(input.value).toBe('hello');
    expect(control(input.renderRoot, '清除').disabled).toBeFalse();
  });

  it('toggles listening and blocks send until listening ends', async () => {
    const input = await render();
    const sent: Event[] = [];
    input.addEventListener('send', (event) => {
      sent.push(event);
    });
    input.value = 'hello';
    await input.updateComplete;

    control(input.renderRoot, '听写').click();
    await input.updateComplete;

    expect(input.listening).toBeTrue();
    const listeningField = input.renderRoot.querySelector('textarea')!;
    expect(listeningField.placeholder).toBe("i'm listening...");
    expect(
      getComputedStyle(input.renderRoot.querySelector('[part="field"]')!)
        .backgroundColor,
    ).toBe('rgb(233, 221, 255)');
    const mic = control(input.renderRoot, '听写');
    const micBackground = getComputedStyle(mic).backgroundImage;
    expect(micBackground).toContain('rgb(92, 141, 255)');
    expect(micBackground).toContain('rgb(160, 121, 255)');
    expect(micBackground).toContain('rgb(208, 106, 214)');
    expect(micBackground).not.toContain('rgb(255, 114, 87)');
    expect(getComputedStyle(mic.shadowRoot!.querySelector('.icon-button')!).color).toBe(
      'rgb(255, 255, 255)',
    );
    const send = control(input.renderRoot, '发送');
    expect(send.disabled).toBeTrue();
    send.click();
    expect(sent.length).toBe(0);

    control(input.renderRoot, '听写').click();
    await input.updateComplete;
    expect(input.listening).toBeFalse();
    expect(control(input.renderRoot, '发送').disabled).toBeFalse();
    expect(input.renderRoot.querySelector('textarea')!.placeholder).toBe(
      'Ask anything or search...',
    );
  });

  it('lists files three per row and images four per row and removes one', async () => {
    const input = await render();
    const changes: number[] = [];
    input.addEventListener('files-change', () => {
      changes.push(input.files.length);
    });
    const picker = input.renderRoot.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )!;

    picker.files = filesOf(
      ['a.txt', 'b.txt', 'c.txt', 'd.txt'],
      'text/plain',
    );
    picker.dispatchEvent(new Event('change'));
    await input.updateComplete;

    const fileItems = [
      ...input.renderRoot.querySelectorAll('[aria-label="文件"] [role="listitem"]'),
    ];
    expect(fileItems.length).toBe(4);
    expect(fileItems[3].getBoundingClientRect().top).toBeGreaterThan(
      fileItems[0].getBoundingClientRect().top,
    );
    expect(fileItems[1].getBoundingClientRect().top).toBe(
      fileItems[0].getBoundingClientRect().top,
    );

    picker.files = filesOf(
      ['1.png', '2.png', '3.png', '4.png'],
      'image/png',
    );
    picker.dispatchEvent(new Event('change'));
    await input.updateComplete;

    const imageItems = [
      ...input.renderRoot.querySelectorAll('[aria-label="图片"] [role="listitem"]'),
    ];
    expect(imageItems.length).toBe(4);
    input.style.width = '640px';
    await input.updateComplete;
    expect(imageItems[3].getBoundingClientRect().top).toBe(
      imageItems[0].getBoundingClientRect().top,
    );
    input.style.width = '374px';
    await input.updateComplete;
    expect(fileItems[1].getBoundingClientRect().top).toBe(
      fileItems[0].getBoundingClientRect().top,
    );
    expect(fileItems[2].getBoundingClientRect().top).toBeGreaterThan(
      fileItems[0].getBoundingClientRect().top,
    );
    expect(imageItems[2].getBoundingClientRect().top).toBe(
      imageItems[0].getBoundingClientRect().top,
    );
    expect(imageItems[3].getBoundingClientRect().top).toBeGreaterThan(
      imageItems[0].getBoundingClientRect().top,
    );
    input.style.width = '';
    await input.updateComplete;
    const field = input.renderRoot.querySelector<HTMLElement>('[part="field"]')!;
    const first = imageItems[0].getBoundingClientRect();
    const second = imageItems[1].getBoundingClientRect();
    const fieldBox = field.getBoundingClientRect();
    expect(Math.round(first.left - fieldBox.left)).toBe(12);
    expect(Math.round(first.top - fieldBox.top)).toBe(12);
    expect(Math.round(second.left - first.right)).toBe(8);
    const remove = control(input.renderRoot, '移除 1.png').getBoundingClientRect();
    expect(remove.right).toBeLessThanOrEqual(first.right + 1);
    expect(remove.top).toBeGreaterThanOrEqual(first.top);
    expect(remove.bottom).toBeLessThan(first.bottom);
    expect(imageItems[0].getBoundingClientRect().width).toBe(96);
    expect(imageItems[0].getBoundingClientRect().height).toBe(96);

    control(input.renderRoot, '移除 a.txt').click();
    await input.updateComplete;

    expect(input.files.map((file) => file.name)).not.toContain('a.txt');
    expect(changes).toEqual([4, 8, 7]);
  });

  it('uses the agreed colors, radius, and control sizes', async () => {
    const input = await render();
    input.style.width = '640px';
    await input.updateComplete;
    input.renderRoot.querySelector('.send')!.getAnimations().forEach((animation) => {
      animation.finish();
    });
    const field = input.renderRoot.querySelector<HTMLElement>('[part="field"]')!;
    const send = control(input.renderRoot, '发送');
    const disclaimer = input.renderRoot.querySelector('p')!;

    const frame = field.parentElement!;
    expect(getComputedStyle(frame).borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(field).borderTopWidth).toBe('0px');
    expect(getComputedStyle(frame).borderRadius).toBe('12px');
    expect(getComputedStyle(field).borderRadius).toBe('24px');
    expect(field.getBoundingClientRect().height).toBe(48);
    expect(send.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      frame.getBoundingClientRect().right - 1,
    );
    expect(getComputedStyle(field).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(send.getBoundingClientRect().width).toBe(48);
    expect(send.getBoundingClientRect().height).toBe(48);
    expect(buttonFace(send).backgroundColor).toContain('0.1');
    expect(getComputedStyle(disclaimer).color).toContain('0.38');

    input.value = 'hello';
    await input.updateComplete;
    const ready = control(input.renderRoot, '发送');
    const clear = control(input.renderRoot, '清除');
    expect(buttonFace(ready).backgroundColor).toBe('rgb(108, 67, 198)');
    expect(buttonFace(clear).backgroundColor).toBe('rgb(218, 226, 255)');

    input.renderRoot.querySelector('textarea')!.focus();
    await input.updateComplete;
    expect(getComputedStyle(field.parentElement!).borderTopColor).toBe(
      'rgb(108, 67, 198)',
    );
    expect(getComputedStyle(input.renderRoot.querySelector('textarea')!).borderTopWidth).toBe('0px');

    control(input.renderRoot, '听写').click();
    await input.updateComplete;
    expect(getComputedStyle(field.parentElement!).borderTopWidth).toBe('2px');
    expect(getComputedStyle(field.parentElement!).backgroundImage).toContain(
      'linear-gradient',
    );

    const picker = input.renderRoot.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )!;
    picker.files = filesOf(['notes.txt'], 'text/plain');
    picker.dispatchEvent(new Event('change'));
    await input.updateComplete;
    const chip = input.renderRoot.querySelector('[aria-label="文件"] [role="listitem"]')!;
    expect(chip.getBoundingClientRect().width).toBe(162);
    expect(chip.getBoundingClientRect().height).toBe(48);
    const fileBox = chip.getBoundingClientRect();
    const fileField = input.renderRoot.querySelector<HTMLElement>(
      '[part="field"]',
    )!;
    const fileFieldBox = fileField.getBoundingClientRect();
    expect(Math.round(fileBox.left - fileFieldBox.left)).toBe(12);
    expect(Math.round(fileBox.top - fileFieldBox.top)).toBe(12);
    const entry = input.renderRoot.querySelector('.entry')!;
    expect(entry.getBoundingClientRect().height).toBe(48);
  });

  it('opens a menu whose only action is upload', async () => {
    const input = await render();
    expect(input.renderRoot.textContent).not.toContain('上传文件');

    control(input.renderRoot, '添加').click();
    await input.updateComplete;

    const upload = [...input.renderRoot.querySelectorAll('md-text-button')].map(
      (button) => button.textContent?.trim(),
    );
    expect(upload).toEqual(['上传文件']);
  });
});

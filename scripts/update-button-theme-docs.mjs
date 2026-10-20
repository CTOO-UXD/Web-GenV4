/**
 * Writes supported button CSS variables into docs/components/button.md.
 * Defaults come from tokens/_md-comp-*.scss and tokens/versions/v0_192.
 */
import {readFile, writeFile} from 'fs/promises';
import {join} from 'path';

const root = join(import.meta.dirname, '..');
const docPath = join(root, 'docs', 'components', 'button.md');

const variants = [
  ['elevated', '凸起按钮', 'md-elevated-button'],
  ['filled', '实心按钮', 'md-filled-button'],
  ['filled-tonal', '浅色实心按钮', 'md-filled-tonal-button'],
  ['outlined', '描边按钮', 'md-outlined-button'],
  ['text', '文字按钮', 'md-text-button'],
];

function block(source, startMarker) {
  const start = source.indexOf(startMarker);
  if (start < 0) {
    throw new Error(`Missing ${startMarker}`);
  }
  const open = source.indexOf('(', start);
  const close = source.indexOf(');', open);
  return source.slice(open + 1, close);
}

function supportedTokens(source) {
  return [...block(source, '$supported-tokens:').matchAll(/'([^']+)'/g)].map(
    (match) => match[1],
  );
}

function defaultsFromVersion(source) {
  const defaults = new Map();
  const body = block(source, '@return');
  for (const match of body.matchAll(
    /'([^']+)'\s*:\s*map\.get\(\s*\$deps\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g,
  )) {
    defaults.set(match[1], `--${match[2]}-${match[3]}`);
  }
  for (const match of body.matchAll(
    /'([^']+)'\s*:\s*if\(\s*\$exclude-hardcoded-values\s*,\s*null\s*,\s*([^)]+?)\)/g,
  )) {
    defaults.set(match[1], match[2].trim());
  }
  return defaults;
}

function hardcoded(source) {
  const defaults = new Map();
  for (const match of source.matchAll(
    /'([^']+)'\s*:\s*if\(\s*\$exclude-hardcoded-values\s*,\s*null\s*,\s*([^)]+?)\)/g,
  )) {
    defaults.set(match[1], match[2].trim());
  }
  for (const match of source.matchAll(
    /(?:^|\n)\s*([a-z0-9-]+)\s*:\s*if\(\s*\$exclude-hardcoded-values\s*,\s*null\s*,\s*([^)]+?)\)/g,
  )) {
    defaults.set(match[1], match[2].trim());
  }
  return defaults;
}

function assignedDefaults(source) {
  const unquotes = new Map();
  for (const match of source.matchAll(
    /\$([A-Za-z0-9_-]+):\s*string\.unquote\(\s*'([^']*)'/g,
  )) {
    unquotes.set(match[1], match[2]);
  }
  const defaults = new Map();
  const start = source.indexOf('$tokens: (');
  if (start < 0) {
    return defaults;
  }
  const end = source.indexOf('validate.values', start);
  const body = source.slice(start, end);
  for (const match of body.matchAll(
    /'([a-z0-9-]+)'\s*:\s*([\s\S]*?)(?=,\s*\n\s*'|\n\s*\))/g,
  )) {
    let value = match[2].trim().replace(/\s+/g, ' ');
    if (value.endsWith(',')) {
      value = value.slice(0, -1).trim();
    }
    if (value.startsWith('var(')) {
      value = value.slice(4, value.lastIndexOf(')')).split(',')[0].trim();
    } else if (value.startsWith('$')) {
      value = unquotes.get(value.slice(1)) ?? value;
    }
    defaults.set(match[1], value);
  }
  return defaults;
}

function renames(source) {
  const renamed = new Map();
  const body = source.includes('$renamed-tokens:')
    ? block(source, '$renamed-tokens:')
    : '';
  for (const match of body.matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) {
    renamed.set(match[2], match[1]);
  }
  return renamed;
}

function tableFromSources(wrapper, version, prefix, title, tag, stylePath = '') {
  const values = version ? defaultsFromVersion(version) : new Map();
  for (const [name, value] of hardcoded(wrapper)) {
    values.set(name, value);
  }
  for (const [name, value] of assignedDefaults(wrapper)) {
    if (!values.has(name)) {
      values.set(name, value);
    }
  }
  const renamedFrom = renames(wrapper);
  const rows = supportedTokens(wrapper).map((token) => {
    const from = renamedFrom.get(token);
    let value = values.get(token) ?? (from ? values.get(from) : undefined);
    if (!value && token.startsWith('container-shape-')) {
      value = `var(${prefix}container-shape)`;
    }
    if (!value) {
      throw new Error(`No default for ${tag} ${token}`);
    }
    return `| \`${prefix}${token}\` | \`${value}\` |`;
  });
  const styleLink = stylePath
    ? `\n全部样式：[${stylePath}](https://github.com/CTOO-UXD/Web-GenV4/blob/main/${stylePath})\n`
    : '';
  return `### ${title} \`<${tag}>\`

| 变量 | 默认值 |
| --- | --- |
${rows.join('\n')}
${styleLink}`;
}

function variantTable(fileBase, title, tag) {
  const wrapperPath = join(root, 'tokens', `_md-comp-${fileBase}-button.scss`);
  const versionPath = join(
    root,
    'tokens',
    'versions',
    'v0_192',
    `_md-comp-${fileBase}-button.scss`,
  );
  return Promise.all([readFile(wrapperPath, 'utf8'), readFile(versionPath, 'utf8')]).then(
    ([wrapper, version]) => tableFromSources(wrapper, version, `--${tag}-`, title, tag),
  );
}

async function writeTheme(docFile, sections, example = '') {
  const path = join(root, 'docs', 'components', docFile);
  const doc = await readFile(path, 'utf8');
  const pattern =
    /<!-- auto-generated theme docs start -->.*<!-- auto-generated theme docs end -->/s;
  if (!pattern.test(doc)) {
    throw new Error(`Theme markers not found in ${docFile}`);
  }
  const next = doc.replace(
    pattern,
    `<!-- auto-generated theme docs start -->

## 主题

用组件 CSS 变量覆盖。下面只列出 Sass 里标记为支持的变量。

${example}${sections.join('\n')}
<!-- auto-generated theme docs end -->`,
  );
  if (next !== doc) {
    await writeFile(path, next);
  }
}

const iconButtonVariants = [
  ['icon', '图标按钮', 'md-icon-button'],
  ['filled-icon', '实心图标按钮', 'md-filled-icon-button'],
  ['filled-tonal-icon', '浅色实心图标按钮', 'md-filled-tonal-icon-button'],
  ['outlined-icon', '描边图标按钮', 'md-outlined-icon-button'],
];

const buttonSections = await Promise.all(
  variants.map(([fileBase, title, tag]) => variantTable(fileBase, title, tag)),
);
await writeTheme('button.md', buttonSections);

const iconButtonSections = await Promise.all(
  iconButtonVariants.map(([fileBase, title, tag]) =>
    variantTable(fileBase, title, tag),
  ),
);
await writeTheme('icon-button.md', iconButtonSections);

const iconWrapper = await readFile(join(root, 'tokens', '_md-comp-icon.scss'), 'utf8');
await writeTheme('icon.md', [
  tableFromSources(iconWrapper, '', '--md-icon-', '图标', 'md-icon'),
]);

const aiInputWrapper = await readFile(
  join(root, 'tokens', '_md-comp-ai-input.scss'),
  'utf8',
);
await writeTheme('ai-input.md', [
  tableFromSources(aiInputWrapper, '', '--md-ai-input-', 'Ai Input', 'md-ai-input'),
]);

const modalThemes = [
  ['modal', '对话弹窗', 'md-modal', 'modal/internal/_modal.scss'],
  ['hero-modal', '主视觉弹窗', 'md-hero-modal', 'hero-modal/internal/_hero-modal.scss'],
  [
    'feature-tour-modal',
    '功能引导',
    'md-feature-tour-modal',
    'feature-tour-modal/internal/_feature-tour-modal.scss',
  ],
  [
    'loading-modal',
    '加载弹窗',
    'md-loading-modal',
    'loading-modal/internal/_loading-modal.scss',
  ],
];
const modalSections = await Promise.all(
  modalThemes.map(async ([fileBase, title, tag, stylePath]) => {
    const wrapper = await readFile(
      join(root, 'tokens', `_md-comp-${fileBase}.scss`),
      'utf8',
    );
    return tableFromSources(wrapper, '', `--${tag}-`, title, tag, stylePath);
  }),
);
await writeTheme('modal.md', modalSections);

const textInputWrapper = await readFile(
  join(root, 'tokens', '_md-comp-text-input.scss'),
  'utf8',
);
const textInputExample = `### 示例

<div class="figure-wrapper">
  <figure style="display:grid;width:min(360px,100%);padding:28px">
    <style>
      .text-input-theme {
        --md-text-input-container-shape: 4px;
        --md-text-input-container-color: #e5f4f3;
        --md-text-input-label-text-color: #006a6a;
        --md-text-input-active-outline-color: #006a6a;
      }
    </style>
    <md-text-input class="text-input-theme" label="Label" value="Input text"></md-text-input>
  </figure>
</div>

\`\`\`html
<style>
  .text-input-theme {
    --md-text-input-container-shape: 4px;
    --md-text-input-container-color: #e5f4f3;
    --md-text-input-label-text-color: #006a6a;
    --md-text-input-active-outline-color: #006a6a;
  }
</style>

<md-text-input class="text-input-theme" label="Label" value="Input text"></md-text-input>
\`\`\`

`;
await writeTheme(
  'text-input.md',
  [tableFromSources(textInputWrapper, '', '--md-text-input-', '文本输入', 'md-text-input')],
  textInputExample,
);

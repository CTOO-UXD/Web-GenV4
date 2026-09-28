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
    ([wrapper, version]) => {
      const prefix = `--${tag}-`;
      const values = defaultsFromVersion(version);
      for (const [name, value] of hardcoded(wrapper)) {
        values.set(name, value);
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
      return `### ${title} \`<${tag}>\`

| 变量 | 默认值 |
| --- | --- |
${rows.join('\n')}
`;
    },
  );
}

const sections = await Promise.all(
  variants.map(([fileBase, title, tag]) => variantTable(fileBase, title, tag)),
);
const doc = await readFile(docPath, 'utf8');
const pattern =
  /<!-- auto-generated theme docs start -->.*<!-- auto-generated theme docs end -->/s;
if (!pattern.test(doc)) {
  throw new Error('Theme markers not found in button.md');
}
const next = doc.replace(
  pattern,
  `<!-- auto-generated theme docs start -->

## 主题

用组件 CSS 变量覆盖。下面只列出 Sass 里标记为支持的变量。

${sections.join('\n')}
<!-- auto-generated theme docs end -->`,
);
if (next !== doc) {
  await writeFile(docPath, next);
}

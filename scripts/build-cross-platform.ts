/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @fileoverview Cross-platform replacements for Unix build pipelines. */

import {spawnSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function walkFiles(
  root: string,
  matches: (name: string) => boolean,
  prunedRootDirs: readonly string[] = [],
) {
  const files: string[] = [];

  function walk(dir: string, isRoot = false) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (isRoot && entry.isDirectory() && prunedRootDirs.includes(entry.name)) {
        continue;
      }
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else if (entry.isFile() && matches(entry.name)) {
        files.push(entryPath);
      }
    }
  }

  walk(root, true);
  return files.sort();
}

function runNode(script: string, args: readonly string[]) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: 'inherit',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function buildSassTokenMeta() {
  const inputs = walkFiles(
    path.join('tokens', 'versions'),
    (name) =>
      name.startsWith('_md-') &&
      name.endsWith('.scss') &&
      !name.endsWith('-meta.scss'),
  );
  runNode(
    path.join('scripts', 'generate-sass-token-meta.js'),
    inputs.map((input) => input.replaceAll(path.sep, '/')),
  );
}

function buildSass() {
  const inputDirs = fs
    .readdirSync('.', {withFileTypes: true})
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        !/(node_modules|catalog)/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort();
  runNode(path.join('node_modules', 'sass', 'sass.js'), [
    '--style=compressed',
    '--load-path=node_modules',
    '--load-path=node_modules/sass-true/sass',
    ...inputDirs,
  ]);
}

function buildCssToTs() {
  const inputs = walkFiles(
    '.',
    (name) => name.endsWith('.css'),
    ['.wireit', 'node_modules', 'catalog'],
  );
  for (const input of inputs) {
    const normalizedInput = `./${path.relative('.', input).replaceAll(path.sep, '/')}`;
    runNode(path.join('scripts', 'css-to-ts.js'), [
      '--suffix=.cssresult',
      normalizedInput,
    ]);
  }
}

switch (process.argv[2]) {
  case 'sass-token-meta':
    buildSassTokenMeta();
    break;
  case 'sass':
    buildSass();
    break;
  case 'css-to-ts':
    buildCssToTs();
    break;
  default:
    throw new Error(
      'Usage: node scripts/build-cross-platform.js ' +
        '<sass-token-meta|sass|css-to-ts>',
    );
}

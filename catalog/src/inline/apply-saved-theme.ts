/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {applyThemeString} from '../utils/apply-theme-string.js';

const root = document.documentElement;
const seed = localStorage.getItem('seed-color');
const mode = localStorage.getItem('color-mode');

// A saved seed uses the generated theme. Otherwise keep the designed colors.
if (seed) {
  root.setAttribute('data-theme', 'seed');
  root.removeAttribute('data-color-mode');
  const lastThemeString = localStorage.getItem('material-theme');
  if (lastThemeString) {
    applyThemeString(document, lastThemeString);
  }
} else {
  root.removeAttribute('data-theme');
  if (mode === 'light' || mode === 'dark') {
    root.setAttribute('data-color-mode', mode);
  } else {
    root.removeAttribute('data-color-mode');
  }
}

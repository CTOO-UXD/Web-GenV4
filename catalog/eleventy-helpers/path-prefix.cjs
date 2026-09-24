/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Site root for the production catalog. GitHub project pages serve the site
 * under /Web-GenV4/; local dev leaves this unset and stays at /.
 * @return {string} Prefix with a trailing slash, or `/`.
 */
function pathPrefix() {
  const raw = process.env.PATH_PREFIX || '';
  const trimmed = raw.replace(/^\/+|\/+$/g, '');
  if (!trimmed) {
    return '/';
  }
  return `/${trimmed}/`;
}

/**
 * @param {string} urlPath Root-absolute path such as `/css/global.css`.
 * @return {string}
 */
function withPrefix(urlPath) {
  const prefix = pathPrefix();
  const path = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  if (prefix === '/') {
    return path;
  }
  return `${prefix.replace(/\/$/, '')}${path}`;
}

module.exports = {pathPrefix, withPrefix};

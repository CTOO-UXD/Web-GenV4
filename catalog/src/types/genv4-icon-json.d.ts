/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

declare module 'genv4-icon/icons.json' {
  const data: {
    icons: Array<{
      name: string;
      set: 'standard' | 'ai';
      filled: boolean;
    }>;
  };
  export default data;
}

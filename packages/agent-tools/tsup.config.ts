import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    entry: {
      index: 'src/index.ts',
      'json/index': 'src/json/index.ts',
      'csv/index': 'src/csv/index.ts',
      'pdf/index': 'src/pdf/index.ts',
      'xml/index': 'src/xml/index.ts',
      'excel/index': 'src/excel/index.ts',
      'image/index': 'src/image/index.ts',
      'markdown/index': 'src/markdown/index.ts',
      'archive/index': 'src/archive/index.ts',
      'regex/index': 'src/regex/index.ts',
      'diff/index': 'src/diff/index.ts',
      'sql/index': 'src/sql/index.ts',
      'crypto/index': 'src/crypto/index.ts',
      'datetime/index': 'src/datetime/index.ts',
      'text/index': 'src/text/index.ts',
      'math/index': 'src/math/index.ts',
      'color/index': 'src/color/index.ts',
      'physics/index': 'src/physics/index.ts',
      'structural/index': 'src/structural/index.ts',
      'settings/index': 'src/settings/index.ts',
      'a2a/index': 'src/a2a/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    treeshake: true,
  },
]);

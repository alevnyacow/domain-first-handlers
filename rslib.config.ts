import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 22'],
      dts: true,
      source: {
        entry: {
          index: './src/index.ts',
          next: './src/REST-adapters/next-adapter.ts',
          express: './src/REST-adapters/express-adapter.ts',
        }
      }
    },
    {
      format: 'cjs',
      syntax: ['node 22'],
      source: {
        entry: {
            index: './src/index.ts',
            next: './src/REST-adapters/next-adapter.ts',
            express: './src/REST-adapters/express-adapter.ts',
        }
      }
    },
  ],
});

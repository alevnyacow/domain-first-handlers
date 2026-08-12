import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
    extends: withRslibConfig(),
    reporters: 'verbose',
    coverage: {
        enabled: true,
        exclude: [
            '**/index.ts',
        ],
        thresholds: {
            functions: 80,
            statements: 55,
            branches: 35,
            lines: 65
        }
    }
});

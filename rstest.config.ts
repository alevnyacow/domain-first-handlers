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
            functions: 75,
            statements: 55,
            branches: 40,
            lines: 50
        }
    }
});

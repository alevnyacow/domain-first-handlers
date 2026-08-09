import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
    extends: withRslibConfig(),
    reporters: 'verbose',
    coverage: {
        enabled: true,
        include: [
            'src/handler/handler.ts',
            'src/REST/create-endpoint.ts',
        ],
        thresholds: {
            functions: 90,
            statements: 55,
            branches: 40,
            lines: 55
        }
    }
});

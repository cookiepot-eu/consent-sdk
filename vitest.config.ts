import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.test.tsx',
        'tests/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.config.mjs',
        '**/serve.js',
        '**/index.ts',  // Export-only files
        '**/index.tsx', // Export-only files
      ],
      thresholds: {
        lines: 69,
        functions: 66,
        branches: 70,
        statements: 69,
      },
    },
  },
});

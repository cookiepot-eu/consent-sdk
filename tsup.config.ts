import { defineConfig } from 'tsup';

export default defineConfig([
  // Main ESM/CJS builds
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: true,
    splitting: false,
    outDir: 'dist',
    external: ['react'],
    noExternal: ['zod'], // Bundle zod into the output
  },
  // React wrapper
  {
    entry: {
      react: 'src/react/index.tsx',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    treeshake: true,
    minify: true,
    splitting: false,
    outDir: 'dist',
    external: ['react'],
    noExternal: ['zod'], // Bundle zod into the output
  },
  // Browser IIFE build for script tag usage
  {
    entry: {
      'consent.min': 'src/browser.ts',
    },
    format: ['iife'],
    globalName: 'CookiePot',
    sourcemap: true,
    treeshake: true,
    minify: true,
    splitting: false,
    outDir: 'dist',
    noExternal: ['zod'], // Bundle everything
    platform: 'browser',
    target: 'es2020',
  },
]);

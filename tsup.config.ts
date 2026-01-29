import { defineConfig } from 'tsup';

export default defineConfig([
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
]);

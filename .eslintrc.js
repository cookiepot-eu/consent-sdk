module.exports = {
  root: true,
  env: {
    es2020: true,
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  ignorePatterns: [
    '/dist/**/*',
    '/node_modules/**/*',
    '*.config.ts',
    '*.config.js',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};

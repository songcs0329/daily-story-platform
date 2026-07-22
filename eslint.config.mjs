import path from 'node:path';
import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const importOrderRule = [
  'error',
  {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
    'newlines-between': 'never',
  },
];

export default tseslint.config(
  globalIgnores(['**/dist/**', '**/coverage/**']),

  // apps/web — Vite + React
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: { prettier, import: eslintPluginImport },
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/order': importOrderRule,
    },
  },

  // apps/api — NestJS, type-checked
  {
    files: ['apps/api/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, eslintPluginPrettierRecommended],
    plugins: { import: eslintPluginImport },
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: path.resolve(import.meta.dirname, 'apps/api'),
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': 'error',
      'import/order': importOrderRule,
    },
  },

  // packages/shared — plain TS
  {
    files: ['packages/shared/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: { prettier, import: eslintPluginImport },
    languageOptions: { globals: globals.node },
    rules: {
      'prettier/prettier': 'error',
      'import/order': importOrderRule,
    },
  },
);

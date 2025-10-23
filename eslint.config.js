import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  eslint.configs.recommended,
  {
    ignores: ['dist/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLElement: 'readonly',
        ErrorEvent: 'readonly',
        PromiseRejectionEvent: 'readonly',
        Event: 'readonly',
        Location: 'readonly',
        TextEncoder: 'readonly',
        Blob: 'readonly',
        fetch: 'readonly',
        MutationObserver: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn', // any 허용하지만 경고
      '@typescript-eslint/no-unsafe-function-type': 'warn',
    },
  },
];

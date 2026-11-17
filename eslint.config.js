import js from '@eslint/js';
import i18next from 'eslint-plugin-i18next';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist', 'dist-ssr', 'node_modules', 'public', 'resume/private', 'coverage'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Every visible string in a component must come from the translation files.
    files: ['src/**/*.tsx'],
    ignores: ['src/**/*.test.tsx'],
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            exclude: [
              'className',
              'href',
              'to',
              'path',
              'id',
              'htmlFor',
              'type',
              'name',
              'rel',
              'target',
              'variant',
              'tone',
              'autoComplete',
              'inputMode',
              'lang',
              'side',
              'align',
              'role',
              'value',
              'src',
              'srcSet',
              'sizes',
              'loading',
              'decoding',
              'method',
              'action',
              'data-.*',
              'aria-hidden',
              'aria-live',
              'aria-current',
              'aria-haspopup',
              'aria-controls',
              'aria-describedby',
              'aria-labelledby',
              'aria-invalid',
              'aria-expanded',
              'targetId',
              'ns',
              'i18nKey',
              'width',
              'height',
              'sandbox',
              'referrerPolicy',
              'allow',
              'media',
              'fetchPriority',
              'dateTime',
              'spellCheck',
              'enterKeyHint',
            ],
          },
        },
      ],
    },
  },
);

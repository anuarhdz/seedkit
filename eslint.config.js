// @ts-check

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/generated/**',
      '**/out/**',
      '**/out-frontmatter/**',
      '**/output/**',
      '**/output_OK/**',
      '**/output_OK2/**',
      '**/components/**',
      '**/mdx/**',
      '**/*.mdx',
      // old backup/test files
      '**/test.js',
      '**/_*.mjs',
      '**/scrape_*.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)

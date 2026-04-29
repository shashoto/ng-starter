// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const importPlugin = require('eslint-plugin-import');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
module.exports = tseslint.config(
  /* ---------------------------------------
   * TypeScript + Angular Lint Configuration
   * --------------------------------------- */
  {
    files: ['**/*.ts'],
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettierRecommended, // Ensures Prettier & ESLint work together
    ],
    plugins: {
      import: importPlugin,
    },
    processor: angular.processInlineTemplates,
    rules: {
      /* -------------------------
       * 🧠 Core Code Quality Rules
       * ------------------------- */
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      'prefer-const': 'warn',
      'arrow-body-style': ['error', 'as-needed'],

      /* -------------------------
       * 📦 Import Order (Improved)
       * ------------------------- */
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      /* -------------------------
       * 🧱 TypeScript Rules
       * ------------------------- */
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',

      /* -------------------------
       * 🅰️ Angular Rules
       * ------------------------- */
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/no-host-metadata-property': 'off',
      '@angular-eslint/use-lifecycle-interface': 'off',

      /* -------------------------
       * 📏 Padding & Readability
       * ------------------------- */
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
      ],
    },
  },

  /* ---------------------------------------
   * HTML Template Linting (Angular)
   * --------------------------------------- */
  {
    files: ['**/*.html'],
    ignores: ['**/dist/**', '**/node_modules/**'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      prettierRecommended,
    ],
    rules: {
      '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],
      '@angular-eslint/template/no-negated-async': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/valid-aria': 'off', // ✅ PrimeNG handles ARIA
    },
  },
);

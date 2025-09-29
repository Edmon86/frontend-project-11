const js = require('@eslint/js')
const globals = require('globals')
const { defineConfig } = require('eslint/config')

module.exports = defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ['dist/**', 'node_modules/**'],
    plugins: { js: js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
    rules: {
      // Стили
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      'space-before-function-paren': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'space-infix-ops': 'error',
      'space-before-blocks': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'comma-spacing': ['error', { before: false, after: true }],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'space-in-parens': ['error', 'never'],
      'no-trailing-spaces': ['error'],
      'semi-spacing': ['error', { before: false, after: true }],
      'arrow-parens': ['error', 'as-needed'], // скобки только если нужно
      'brace-style': ['error', 'stroustrup', { allowSingleLine: false }], // else на той же строке
      'quote-props': ['error', 'as-needed'], // исправляет ошибки кавычек у ключей
    },
  },
])

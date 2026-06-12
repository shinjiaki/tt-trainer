// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = defineConfig([
  expoConfig,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // Import hygiene
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // Unused imports/vars — handled by the dedicated plugin so it can auto-fix.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Encourage consistency
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },
  // Keep prettier last so it disables any formatting rules that would fight Prettier.
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*', 'expo-env.d.ts'],
  },
]);

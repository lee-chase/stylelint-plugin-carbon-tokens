import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import js from '@eslint/js';

export default [
  // Ignore patterns (migrated from .eslintignore)
  {
    ignores: ['node_modules/', 'dist/'],
  },
  // Base configurations
  // Note: ESLint v9 changes to recommended rules:
  // - require-jsdoc and valid-jsdoc rules have been removed
  // - no-inner-declarations has new default behavior
  // - no-unused-vars now defaults caughtErrors to "all"
  // - no-useless-computed-key flags unnecessary computed member names in classes by default
  // - camelcase allow option only accepts an array of strings
  js.configs.recommended,
  {
    // Global settings
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        rule: 'readonly',
        testRule: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // Environment settings
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    // Import plugin settings
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['', './public'], // <-- this line
          ],
          extensions: ['.js'],
        },
        node: {
          paths: ['src'],
          extensions: ['.js'],
        },
      },
    },
  },
  // Import plugin configuration
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
    },
  },
  // Prettier configuration
  {
    plugins: {
      prettier,
    },
    rules: {
      // ESLint rules
      'comma-dangle': [
        'error',
        {
          arrays: 'ignore',
          objects: 'ignore',
          imports: 'ignore',
          exports: 'ignore',
          functions: 'ignore',
        },
      ],
      'max-len': [
        'error',
        {
          tabWidth: 2,
          code: 140,
          comments: 140,
          ignoreComments: false,
          ignoreTrailingComments: false,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: false,
        },
      ],
      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],
      'no-plusplus': 'off',
      'no-underscore-dangle': 'off',
      'prefer-rest-params': 'off',

      // Import plugin rules
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/order': 'off',

      // JSX a11y rules
      'jsx-a11y/no-autofocus': 'off',

      // Prettier rules
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'es5',
        },
      ],
    },
  },
  // Prettier config (must be last to override other rules)
  eslintConfigPrettier,
];

// @ts-check
// Flat config (ESLint 9). This is the shared base for the whole workspace;
// each package's lint script runs `eslint .` and resolves up to this file.
// React-specific configs (eslint-plugin-react-hooks, jsx-a11y) are added for
// apps/web in Stage 2, when the Vite/React app is scaffolded.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.vite/**',
      '**/*.tsbuildinfo',
      // shadcn primitives are vendored copy-paste code — do not lint or edit.
      'apps/web/src/components/ui/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Type-aware parsing across the monorepo. projectService locates the right
  // tsconfig per file; allowDefaultProject covers root-level JS config files.
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Project-wide rules enforcing the CLAUDE.md conventions.
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // NO default exports — named exports only.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports only (project rule: NO default exports).',
        },
      ],
    },
  },

  // TanStack Router signals navigation by throwing redirect()/notFound(), whose
  // return types aren't Error subclasses. Allow that idiom in route files.
  {
    files: ['apps/web/src/routes/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: ['Redirect', 'NotFoundError'],
            },
          ],
        },
      ],
    },
  },

  // Tooling/config files may use default exports and run in Node.
  {
    files: ['**/*.config.{js,ts,mts,cts}'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-restricted-syntax': 'off' },
  },

  // Plain JS (config/tooling) — no type-aware linting.
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  // Must stay last: turn off rules that conflict with Prettier formatting.
  eslintConfigPrettier,
);

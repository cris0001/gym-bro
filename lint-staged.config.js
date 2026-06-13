// Runs on staged files only (fast pre-commit). Full typecheck runs in CI.
// eslint-config-prettier disables formatting rules, so ESLint and Prettier
// don't fight; ESLint --fix runs first, Prettier has the final formatting say.
export default {
  '*.{ts,tsx,js,jsx,cjs,mjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml,css}': ['prettier --write'],
};

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  rules: {
    'no-console': 'off',
    'no-extra-boolean-cast': 'off',
    'newline-after-var': ['error', 'always'],
    'arrow-parens': [2, 'as-needed'],
    'prettier/prettier': 2,
    eqeqeq: ['error', 'always'],
    'import/extensions': ['error', 'always'],
    'import/no-unresolved': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};

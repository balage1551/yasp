module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-mutating-props': 'warn',
    'vue/valid-v-slot': ['error', { allowModifiers: true }],
    'comma-dangle': 'off',
    'no-multiple-empty-lines': 'warn',

    'func-call-spacing': 'error',
    'space-before-function-paren': ['error', { anonymous: 'never', named: 'never' }],

    'vue/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-extra-non-null-assertion': 'warn'
  }
}

const rulesToIgnore = [
  'no-underscore-dangle',
  'no-param-reassign',
  'no-use-before-define',
  'no-plusplus',
  'no-await-in-loop',
  'radix',
  'prefer-destructuring',
  'no-shadow',
  'no-loop-func',
  'eqeqeq',
  'no-useless-concat',
  'prefer-const',
  'no-return-await',
  'prefer-object-spread',
]

module.exports = {
  extends: [
    '../.eslintrc.js',
    'eslint-config-prettier',
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  plugins: ['prettier', 'mocha'],
  globals: {
    it: true,
    artifacts: true,
    contract: true,
    describe: true,
    before: true,
    beforeEach: true,
    web3: true,
    assert: true,
    abi: true,
    after: true,
    afterEach: true,
  },
  rules: {
    'mocha/no-exclusive-tests': 'error',
    'prettier/prettier': [
      'error',
      {
        'semi': false
      },
      'error',
      { 'singleQuote': true, 'parser': 'flow' },
    {'linebreak-style': ['error', 'unix']},
    quotes: [
      'error',
      'single',
      {avoidEscape: true, allowTemplateLiterals: false},
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      },
    ],
    'brace-style': 0,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'standard/computed-property-even-spacing': 0,
    'standard/object-curly-even-spacing': 0,
    'standard/array-bracket-even-spacing': 0,
    'promise/prefer-await-to-then': 'warn',
    'import/prefer-default-export': 'off',
    'import/extensions': [2, 'never'],
  },
}

module.exports = {
  env: {
    browser: true,
    es6: true
  },
  parser: 'babel-eslint',
  extends: ['airbnb', 'eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react', 'react-native'],
  rules: {
    'no-console': 0,
    'no-unresolved': 0,
    'react/prefer-stateless-function': 0,
    'react/display-name': 0,
    'react/jsx-boolean-value': 2,
    'react/jsx-no-comment-textnodes': 1,
    'react/jsx-no-duplicate-props': 2,
    'react/jsx-no-undef': 2,
    'react/jsx-sort-props': 0,
    'react/jsx-uses-react': 1,
    'react/jsx-uses-vars': 1,
    'react/no-did-mount-set-state': 1,
    'react/no-did-update-set-state': 1,
    'react/no-multi-comp': 0,
    'react/no-string-refs': 1,
    'react/no-unknown-property': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 1,
    'react/self-closing-comp': 1,
    'react/wrap-multilines': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react-native/no-inline-styles': 0,
    'no-unused-vars': 0,
    'no-underscore-dangle': 0, //标识符不能以_开头或结尾
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: 0,
    'import/prefer-default-export': 0,
    'react/destructuring-assignment': 0,
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'import/no-unresolved': 0,
    'consistent-return': 0,
    'react/forbid-prop-types': [2, { forbid: ['any'] }], //禁止某些propTypes
    'comma-dangle': 0, //对象字面量项尾不能有逗号
    'arrow-parens': 0 //箭头函数用小括号括起来
  }
}

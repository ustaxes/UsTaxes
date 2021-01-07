module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:react/recommended',
    'standard'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    // proptypes validation as warnings for now
    // in js defining extra prop types is a little
    // cumbersome. Remember to remove if we switch to TS
    'react/prop-types': 1
  }
}

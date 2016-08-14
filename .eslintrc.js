module.exports = {
  env: {
    browser: true,
    es6: true
  },
  parser: "babel-eslint",
  extends: "eslint:recommended",
  rules: {
    "indent": [
      "warn",
      2
    ],
    "quotes": [
      "warn",
      "double"
    ],
    "semi": [
      "warn",
      "never"
    ],
    "no-unused-vars": "warn",
    "comma-dangle": "warn",
    "no-console": "warn",
    "no-debugger": "warn"
  },
  globals: {
    createjs: false,
    riot: false
  }
}

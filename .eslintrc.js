module.exports = {
  env: {
    browser: true,
    es6: true
  },
  parser: "babel-eslint",
  extends: "eslint:recommended",
  plugins: [
    "react"
  ],
  rules: {
    "indent": [
      "warn",
      2
    ],
    "quotes": [
      "warn",
      "double",
      { allowTemplateLiterals: true }
    ],
    "semi": [
      "warn",
      "never"
    ],
    "no-unused-vars": "warn",
    "comma-dangle": "warn",
    "no-console": "warn",
    "no-debugger": "warn",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error"
  },
  globals: {
    createjs: false,
    riot: false
  }
}

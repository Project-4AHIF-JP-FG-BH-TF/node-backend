module.exports = {
  root: true,
  env: {
    browser: false,
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  extends: ["@nuxtjs/eslint-config-typescript", "plugin:prettier/recommended"],
  plugins: [],
  rules: {
    "no-console": "off",
    "no-use-before-define": ["error", {
      "functions": false,
      "classes": false,
      "variables": false,
      "allowNamedExports": false
    }]
  },
};

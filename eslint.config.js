/* eslint-disable @typescript-eslint/no-require-imports */
const tseslint = require("typescript-eslint");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const stylisticJs = require("@stylistic/eslint-plugin-js");

module.exports = [
    {
        plugins: {
            "@stylistic/js": stylisticJs,
        },
        rules: {
            semi: "error",
            "prefer-const": "error",
            "no-trailing-spaces": "error",
            "@stylistic/js/no-trailing-spaces": "error",
        },
    },
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
];

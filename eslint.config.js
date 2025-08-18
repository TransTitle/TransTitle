import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js, '@stylistic': stylistic},
        extends: ["js/recommended"],
        languageOptions: { globals: globals.node },
        rules: {
            '@stylistic/indent': ['error'],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/no-trailing-spaces': 'error',
            semi: ["error", "always"],
        },
    },
]);

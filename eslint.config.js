import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const commonRestrictedImports = [
  {
    group: ["../../../*", "../../../../*", "../../../../../*"],
    message:
      "Use a configured path alias instead of a relative import spanning three or more levels.",
  },
  {
    group: ["@test/*"],
    message: "Production code must not import test support.",
  },
];

const layerRule = (groups) => [
  "error",
  {
    patterns: [...commonRestrictedImports, ...groups],
  },
];

export default tseslint.config(
  {
    ignores: [
      ".agents/**",
      ".steering/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "tests/fixtures/architecture/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        {
          ignoreArrowShorthand: true,
        },
      ],
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerRule([
        {
          group: ["@application/*", "@infrastructure/*", "@ui/*", "@app/*"],
          message: "Domain may only depend on Domain.",
        },
      ]),
    },
  },
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerRule([
        {
          group: ["@infrastructure/*", "@ui/*", "@app/*"],
          message: "Application may only depend on Domain and Application.",
        },
      ]),
    },
  },
  {
    files: ["src/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerRule([
        {
          group: ["@ui/*", "@app/*"],
          message: "Infrastructure must not depend on UI or App.",
        },
      ]),
    },
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerRule([
        {
          group: ["@infrastructure/*", "@app/*"],
          message: "UI must not depend on Infrastructure or App.",
        },
      ]),
    },
  },
  {
    files: ["scripts/**/*.mjs", "eslint.config.js"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
);

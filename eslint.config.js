import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginImport from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    plugins: {
      import: eslintPluginImport,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // TypeScript-specific rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],

      // Import rules - matches Prettier @trivago/prettier-plugin-sort-imports
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "astro",
              group: "external",
              position: "before",
            },
            {
              pattern: "astro/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next", "astro"],
          alphabetize: { order: "asc", caseInsensitive: true },
          distinctGroup: true,
        },
      ],
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "off", // Handled by TypeScript

      // General code quality
      "no-console": "error",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "no-implicit-coercion": "warn",
      "no-unused-expressions": "error",
      "prefer-template": "error",
      "object-shorthand": "error",
      "no-duplicate-imports": "warn",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "tests/**/*"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vitest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      // Allow console in test files for debugging
      "no-console": "off",
      // Allow any in test files for mocking
      "@typescript-eslint/no-explicit-any": "off",
      // Relax strict boolean expressions in tests
      "@typescript-eslint/strict-boolean-expressions": "off",
    },
  },
  {
    files: ["scripts/**/*.ts"],
    rules: {
      // Allow console in CLI scripts
      "no-console": "off",
      // Allow any in CLI scripts for flexibility
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [
      "dist/**",
      "**/dist/**",
      "**/*.d.ts",
      ".astro/**",
      "public/**",
      "html/**",
      "coverage/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      ".prettierrc.mjs",
      "docs/**",
      "scripts/**/*.js",
      "scripts/**/*.test.ts",
      "tests/**/*.js",
      "src/scripts/wp-to-mdx/**",
      "scripts/dist/**",
      "scripts/xml2markdown/dist/**",
      "/tmp/**",
    ],
  },
];

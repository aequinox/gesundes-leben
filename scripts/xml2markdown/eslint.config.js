import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      ".nyc_output/**",
      "*.min.js",
      ".tsbuildinfo",
      "eslint.config.js",
      "vitest.config.js",
      "test-utils/**",
      "**/*.d.ts",
      "**/*.test.ts",
      "**/*.spec.ts",
    ],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: ["./tsconfig.json"],
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      
      // TypeScript-specific rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { 
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      
      // Code quality rules
      "no-console": "error",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "prefer-destructuring": [
        "warn",
        {
          array: true,
          object: true,
        },
      ],
      
      // Async/await rules
      "prefer-promise-reject-errors": "error",
      "require-await": "error",
      "no-return-await": "error",
      
      // Code style consistency
      "curly": ["error", "all"],
      "eqeqeq": ["error", "always"],
      "no-else-return": "error",
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "no-lonely-if": "error",
      
      // Performance and best practices
      "no-loop-func": "error",
      "no-await-in-loop": "warn",
      "array-callback-return": "error",
      "no-useless-return": "error",
      "no-useless-concat": "error",
      "no-useless-escape": "error",
      
      // Error prevention
      "no-shadow": "off", // Replaced by @typescript-eslint version
      "@typescript-eslint/no-shadow": "error",
      "no-use-before-define": "off", // Replaced by @typescript-eslint version
      "@typescript-eslint/no-use-before-define": "error",
      
      // Import/export rules
      "no-duplicate-imports": "error",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-console": "error",
    },
  },
  eslintConfigPrettier,
];

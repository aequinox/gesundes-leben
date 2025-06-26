/** @type {import("prettier").Config} */
export default {
  arrowParens: "avoid",
  semi: true,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  endOfLine: "lf",
  plugins: [
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-astro-organize-imports", // MUST come last
  ],
  astroOrganizeImportsMode: "All",
  tailwindStylesheet: "./src/styles/global.css",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};

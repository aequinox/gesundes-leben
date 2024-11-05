module.exports =  {
  "*.ts": "eslint",
  "*.{astro,js,jsx,md,mdx,ts,tsx}": "prettier --write --plugin=prettier-plugin-astro",
  "*.svelte": "prettier --write --plugin=prettier-plugin-svelte"
}
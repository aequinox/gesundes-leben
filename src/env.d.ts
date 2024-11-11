/// <reference types="astro/client" />
/// <reference types="astro/astro-jsx" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION: string;
  readonly PUBLIC_GOOGLE_ANALYTICS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

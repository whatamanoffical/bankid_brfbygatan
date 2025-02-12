// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_WORDPRESS_API_URL: string;
    NEXT_PUBLIC_WORDPRESS_SITE_URL: string;
    BANKID_API_URL: string;
    BANKID_API_KEY: string;
    // Add other environment variables
  }
}

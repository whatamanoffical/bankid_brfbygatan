// src/config/constants.ts
export const CONFIG = {
  wordpress: {
    apiUrl: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
    siteUrl: process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL,
  },
  bankid: {
    apiUrl: process.env.BANKID_API_URL,
    refreshInterval: 2000,
    maxRetries: 3,
  },
} as const;

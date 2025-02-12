// src/lib/config.ts
export function validateConfig() {
  const required = [
    "NEXT_PUBLIC_WORDPRESS_API_URL",
    "NEXT_PUBLIC_WORDPRESS_ORIGIN",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

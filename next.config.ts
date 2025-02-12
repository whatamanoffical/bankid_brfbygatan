/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: true, // Ensure this is needed for Next.js 15
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localtest.local/wp-json/bankid/v1/:path*", // Proxy to WordPress API
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || "*", // ✅ CORS fix
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "banksign-test.azurewebsites.net", // ✅ BankID QR Image fix
      },
    ],
  },
};

module.exports = nextConfig;

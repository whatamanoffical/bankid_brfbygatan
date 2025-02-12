// src/utils/analytics.ts
export const logAuthEvent = (event: {
  type: "bankid_auth" | "wordpress_check" | "wordpress_login";
  status: "success" | "error";
  personalNumber?: string;
  error?: string;
}) => {
  console.log(`[${new Date().toISOString()}] Auth Event:`, event);
  // Add your analytics service here
};

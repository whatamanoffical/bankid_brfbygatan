"use client";

import { useState, useEffect } from "react";

export default function WPStatus() {
  const [wpStatus, setWPStatus] = useState("Checking...");

  useEffect(() => {
    async function checkWordPressConnection() {
      try {
        const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

        if (!WP_API_URL) {
          throw new Error(
            "❌ WordPress API URL is missing in environment variables."
          );
        }

        console.log("🔄 Checking WordPress API:", WP_API_URL);

        // Test the user-check route with a dummy personal number
        const res = await fetch(
          `${WP_API_URL}/bankid/v1/check-user?personal_number=199001011234`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) {
          throw new Error(
            `❌ WordPress API responded with status: ${res.status}`
          );
        }

        const data = await res.json();
        console.log("✅ WordPress API Response:", data);

        setWPStatus(data.success ? "✅ Working" : "❌ Failed");
      } catch (error) {
        console.error("❌ WordPress API Error:", error);
        setWPStatus("❌ Failed");
      }
    }

    checkWordPressConnection();
  }, []);

  return (
    <div className="flex justify-between p-2 border-b border-gray-200">
      <span className="font-medium">WordPress API</span>
      <span
        className={`font-bold ${
          wpStatus.includes("✅") ? "text-green-600" : "text-red-600"
        }`}
      >
        {wpStatus}
      </span>
    </div>
  );
}

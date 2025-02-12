"use client";

import { useState, useEffect } from "react";

interface ApiStatus {
  bankidSign: string;
  bankidStatus: string;
  wordpress: string;
  env: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<ApiStatus>({
    bankidSign: "Checking...",
    bankidStatus: "Checking...",
    wordpress: "Checking...",
    env: "Checking...",
  });

  useEffect(() => {
    async function checkServices() {
      try {
        // Check BankID Sign API
        const signRes = await fetch("/api/bankid/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userVisibleData: "Test Sign" }),
        });
        const signData = await signRes.json();
        setStatus((prev) => ({
          ...prev,
          bankidSign: signRes.ok
            ? "✅ Working"
            : `❌ Failed - ${
                signData?.authResponse?.ErrorMessage || "Unknown Error"
              }`,
        }));

        // Check BankID Status API
        const statusRes = await fetch("/api/bankid/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderRef: "test-order-ref" }),
        });
        const statusData = await statusRes.json();
        setStatus((prev) => ({
          ...prev,
          bankidStatus: statusRes.ok
            ? "✅ Working"
            : `❌ Failed - ${
                statusData?.authResponse?.ErrorMessage || "Unknown Error"
              }`,
        }));

        // Check WordPress API
        const wpRes = await fetch(
          process.env.NEXT_PUBLIC_WORDPRESS_IFRAME_URL || "",
          { method: "GET" }
        );
        setStatus((prev) => ({
          ...prev,
          wordpress: wpRes.ok
            ? "✅ Working"
            : `❌ Failed - ${wpRes.statusText}`,
        }));

        // Check Environment Variables
        setStatus((prev) => ({
          ...prev,
          env: process.env.BANKID_API_USER
            ? "✅ Loaded"
            : "❌ Missing ENV Vars",
        }));
      } catch (error) {
        console.error("Error checking services:", error);
      }
    }

    checkServices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 System Status</h1>
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-4">
        <StatusItem label="BankID Sign API" value={status.bankidSign} />
        <StatusItem label="BankID Status API" value={status.bankidStatus} />
        <StatusItem label="WordPress API" value={status.wordpress} />
        <StatusItem label="Environment Variables" value={status.env} />
      </div>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between p-2 border-b border-gray-200">
      <span className="font-medium">{label}</span>
      <span
        className={`font-bold ${
          value.includes("✅") ? "text-green-600" : "text-red-600"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

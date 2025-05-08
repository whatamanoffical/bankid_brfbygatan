"use client";

import { useState, useEffect } from "react";

interface UserStatus {
  personalNumber: string;
  status: string;
  message?: string; // Optional message for more details from the API
}

interface PersonalNumberStatusListProps {
  personalNumbers: string[];
  wpApiUrl?: string; // Allow overriding for testing or specific contexts
}

export default function PersonalNumberStatusList({
  personalNumbers,
  wpApiUrl,
}: PersonalNumberStatusListProps) {
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>(() =>
    personalNumbers.map((pn) => ({
      personalNumber: pn,
      status: "⏳ Pending...",
    }))
  );

  useEffect(() => {
    const API_URL = wpApiUrl || process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

    if (!API_URL) {
      setUserStatuses((prevStatuses) =>
        prevStatuses.map((user) => ({
          ...user,
          status: "❌ Config Error",
          message: "WordPress API URL is not configured.",
        }))
      );
      return;
    }

    if (personalNumbers.length === 0) {
      return;
    }

    personalNumbers.forEach(async (pn) => {
      setUserStatuses((prev) =>
        prev.map((user) =>
          user.personalNumber === pn
            ? { ...user, status: "🔄 Checking..." }
            : user
        )
      );
      try {
        const res = await fetch(
          `${API_URL}/bankid/v1/check-user?personal_number=${pn}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json(); // Assuming the API always returns JSON

        if (!res.ok) {
          // Handle HTTP errors (e.g., 404, 500)
          setUserStatuses((prevStatuses) =>
            prevStatuses.map((user) =>
              user.personalNumber === pn
                ? {
                    ...user,
                    status: `❌ HTTP Error ${res.status}`,
                    message: data.message || "Failed to fetch status.",
                  }
                : user
            )
          );
        } else {
          // HTTP success, check the 'success' field in the response data
          setUserStatuses((prevStatuses) =>
            prevStatuses.map((user) =>
              user.personalNumber === pn
                ? {
                    ...user,
                    status: data.success ? "✅ Found" : "❔ Not Found",
                    message:
                      data.message ||
                      (data.success ? "User exists." : "User does not exist."),
                  }
                : user
            )
          );
        }
      } catch (error) {
        console.error(`❌ Error checking PNO ${pn}:`, error);
        setUserStatuses((prevStatuses) =>
          prevStatuses.map((user) =>
            user.personalNumber === pn
              ? {
                  ...user,
                  status: "❌ Request Failed",
                  message:
                    error instanceof Error
                      ? error.message
                      : "Unknown error during request.",
                }
              : user
          )
        );
      }
    });
  }, [personalNumbers, wpApiUrl]); // Rerun if personalNumbers prop or wpApiUrl changes

  if (personalNumbers.length === 0) {
    return (
      <p className="text-gray-600">
        No personal numbers provided for status check.
      </p>
    );
  }

  return (
    <div className="p-4 my-4 border border-gray-200 rounded-lg shadow-md bg-white">
      <h3 className="text-xl font-semibold mb-3 text-gray-700">
        Personal Number Status Check
      </h3>
      <ul className="space-y-2">
        {userStatuses.map(({ personalNumber, status, message }) => (
          <li
            key={personalNumber}
            className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0"
          >
            <span className="text-gray-800">{personalNumber}</span>
            <div className="text-right">
              <span
                className={`font-semibold text-sm px-2 py-1 rounded-full ${
                  status.includes("✅") // Found
                    ? "bg-green-100 text-green-700"
                    : status.includes("❌") // Error
                    ? "bg-red-100 text-red-700"
                    : status.includes("❔") // Not Found
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700" // Pending, Checking
                }`}
              >
                {status}
              </span>
              {message && (
                <p className="text-xs text-gray-500 mt-1">{message}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from "react";
import type { UserData, BankIDStatusHookResult } from "@/types/bankid";

export function useBankIDStatus(): BankIDStatusHookResult {
  const [status, setStatus] = useState<string>("pending");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async (orderRef: string) => {
    try {
      const response = await fetch("/api/bankid/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderRef }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Status check failed");
      }

      setStatus(data.status);
      if (data.userData) {
        setUserData(data.userData);
      }

      return {
        status: data.status,
        userData: data.userData,
        hintCode: data.hintCode,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Status check failed";
      setError(message);
      throw err;
    }
  };

  return {
    status,
    userData,
    error,
    checkStatus,
  };
}

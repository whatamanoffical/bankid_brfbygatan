// src/hooks/useWordPressAuth.ts
import { useState, useCallback } from "react";
import {
  BankIDUser,
  WordPressLoginResponse,
  WordPressError,
} from "@/types/bankid";

export function useWordPressAuth() {
  const [wpExists, setWpExists] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkUser = useCallback(
    async (personalNumber: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/wordpress/check?personal_number=${personalNumber}`,
          {
            headers: {
              Accept: "application/json",
            },
            credentials: "include", // include credentials for cookie support
          }
        );

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          throw new Error("Invalid response from server");
        }

        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          );
        }

        if (typeof data.success !== "boolean") {
          throw new Error("Invalid response format");
        }

        return data.success;
      } catch (error) {
        console.error("WordPress check error:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to check WordPress user"
        );
      }
    },
    []
  );

  const loginUser = useCallback(
    async (personalNumber: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/wordpress/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include", // include credentials for cookie support
          body: JSON.stringify({ personal_number: personalNumber }),
        });

        if (!response.ok) {
          const errorData: WordPressError = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data: WordPressLoginResponse = await response.json();
        console.log("WordPress login response:", data);
        return data.success;
      } catch (error) {
        console.error("WordPress login error:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to login WordPress user"
        );
      }
    },
    []
  );

  const handleBankIDUser = useCallback(
    async (bankIDUser: BankIDUser): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // First check if user exists
        console.log("Checking WordPress user:", bankIDUser.personalNumber);
        const exists = await checkUser(bankIDUser.personalNumber);
        setWpExists(exists);

        if (!exists) {
          const errorMsg = "User not found in WordPress";
          setError(errorMsg);
          console.log(errorMsg);
          return false;
        }

        // If user exists, proceed with login
        console.log("Attempting WordPress login");
        const loginSuccess = await loginUser(bankIDUser.personalNumber);

        if (!loginSuccess) {
          const errorMsg = "Failed to login to WordPress";
          setError(errorMsg);
          console.log(errorMsg);
          return false;
        }

        console.log("WordPress login successful");
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("WordPress auth error:", errorMsg);
        setError(errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [checkUser, loginUser]
  );

  return {
    wpExists,
    isLoading,
    error,
    handleBankIDUser,
  };
}

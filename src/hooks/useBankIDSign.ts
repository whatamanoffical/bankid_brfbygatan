// src/hooks/useBankIDSign.ts
import { useState, useCallback } from "react";
import type { BankIDSignHookResult } from "@/types/bankid";

export function useBankIDSign(): BankIDSignHookResult {
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSign = useCallback(async () => {
    try {
      const response = await fetch("/api/bankid/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate BankID sign");
      }

      const signResponse = data.response.apiCallResponse?.Response;
      if (!signResponse) {
        throw new Error("Invalid response from BankID service");
      }

      setOrderRef(signResponse.OrderRef);
      setQrCodeUrl(signResponse.QrImage || null);

      return {
        orderRef: signResponse.OrderRef,
        autoStartToken: signResponse.AutoStartToken,
        qrCodeUrl: signResponse.QrImage,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start BankID sign";
      setError(message);
      throw err;
    }
  }, []);

  return {
    orderRef,
    qrCodeUrl,
    error,
    startSign,
  };
}

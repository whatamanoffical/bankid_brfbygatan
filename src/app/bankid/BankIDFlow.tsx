"use client";

import { useState, useEffect, useCallback } from "react";
import { useBankIDSign } from "@/hooks/useBankIDSign";
import { useBankIDStatus } from "@/hooks/useBankIDStatus";
import { useWordPressAuth } from "@/hooks/useWordPressAuth";
import { StatusDisplay } from "@/components/bankid/StatusDisplay";
import { QRCodeDisplay } from "@/components/bankid/QRCodeDisplay";
import { StatusLog } from "@/components/bankid/StatusLog";
import { SignStatus, BankIDUser, ParentMessage } from "@/types/bankid";
import { bankIDService } from "@/lib/bankid";
import { WordPressUser } from "@/context/WordPressContext";

interface BankIDFlowProps {
  onError?: (error: unknown) => void;
  onLoginSuccess?: (user: WordPressUser) => void;
}

export default function BankIDFlow({ onError }: BankIDFlowProps) {
  // States
  const [status, setStatus] = useState<SignStatus>("initiating");
  const [qrRefreshKey, setQrRefreshKey] = useState<number>(Date.now());
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Flag to stop re-triggering flow after login success
  const [loginComplete, setLoginComplete] = useState<boolean>(false);

  // Custom hooks
  const { startSign, orderRef, qrCodeUrl } = useBankIDSign();
  const { checkStatus, userData } = useBankIDStatus();
  const {
    handleBankIDUser,
    wpExists,
    isLoading: wpLoading,
    error: wpError,
  } = useWordPressAuth();

  // Device detection
  const isMobile =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Logging helper
  const addLog = useCallback((message: string) => {
    setStatusLog((prev) => [
      ...prev,
      `${new Date().toISOString()} - ${message}`,
    ]);
  }, []);

  // Parent communication
  const notifyParent = useCallback(
    (type: ParentMessage["type"], data: Record<string, unknown>) => {
      const origin = process.env.NEXT_PUBLIC_WORDPRESS_ORIGIN || "*";
      window.parent.postMessage({ type, data }, origin);
    },
    []
  );

  // Error handling
  const handleError = useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      setError(message);
      setStatus("error");
      addLog(`Error: ${message}`);
      onError?.(error);
    },
    [addLog, onError]
  );

  // Handle successful WordPress login and redirect
  const handleSuccessfulLogin = useCallback(
    async (user: BankIDUser) => {
      try {
        addLog(
          "BankID login complete, notifying parent for first-party login..."
        );
        notifyParent("BANKID_LOGIN_SUCCESS", {
          personalNumber: user.personalNumber,
          name: user.name,
          redirect:
            "https://rev.brfbygatan.se/process-bankid-login/?personal_number=" +
            encodeURIComponent(user.personalNumber),
        });
        setLoginComplete(true);
      } catch (err) {
        handleError(err);
      }
    },
    [addLog, notifyParent, handleError]
  );
  // WordPress integration
  const handleWordPressIntegration = useCallback(
    async (user: BankIDUser) => {
      addLog("Checking WordPress user...");
      try {
        const success = await handleBankIDUser(user);
        if (success) {
          addLog("WordPress login successful");
          await handleSuccessfulLogin(user);
          return true;
        } else {
          addLog("WordPress user verification failed");
          notifyParent("BANKID_USER_NOT_FOUND", {
            personalNumber: user.personalNumber,
            name: user.name,
          });
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        addLog(`WordPress error: ${errorMessage}`);
        handleError(err);
        return false;
      }
    },
    [handleBankIDUser, handleSuccessfulLogin, addLog, notifyParent, handleError]
  );

  // BankID polling
  const pollStatus = useCallback(async () => {
    if (!orderRef || loginComplete) return;
    try {
      const result = await checkStatus(orderRef);
      addLog(
        `Status: ${result.status} ${
          result.hintCode ? `(${result.hintCode})` : ""
        }`
      );
      if (result.status === "complete" && result.userData) {
        setStatus("complete");
        await handleWordPressIntegration(result.userData);
        return true;
      } else if (result.status === "failed" || result.status === "error") {
        handleError(result.hintCode || "BankID process failed");
      } else {
        setStatus("pending");
      }
    } catch (err) {
      handleError(err);
    }
  }, [
    orderRef,
    checkStatus,
    handleWordPressIntegration,
    addLog,
    handleError,
    loginComplete,
  ]);

  // Initialize BankID (only if not already logged in)
  useEffect(() => {
    if (loginComplete) return;
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    async function init() {
      try {
        if (!mounted) return;
        setStatus("initiating");
        setError(null);
        addLog("Starting BankID authentication...");
        const result = await startSign();
        if (!mounted) return;
        addLog(`BankID sign initiated (OrderRef: ${result.orderRef})`);
        if (result.qrCodeUrl) {
          addLog("QR code URL received");
        }
        setStatus("pending");
        if (isMobile && result.autoStartToken) {
          const returnUrl = window.location.href;
          const bankIdUrl = bankIDService.getAppUrl(
            result.autoStartToken,
            returnUrl
          );
          // Redirect for mobile users
          timeoutId = setTimeout(() => {
            if (mounted) {
              window.location.href = bankIdUrl;
            }
          }, 100);
        }
      } catch (err) {
        if (mounted) {
          handleError(err);
        }
      }
    }
    init();
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [loginComplete, addLog, handleError, isMobile, startSign]);

  // Set up polling (skip if loginComplete is true)
  useEffect(() => {
    if (loginComplete) return;
    let mounted = true;
    let statusInterval: NodeJS.Timeout;
    let qrInterval: NodeJS.Timeout;
    const statusRef = { current: status };
    if (status === "pending" && orderRef) {
      const pollStatusInterval = async () => {
        if (!mounted) return;
        await pollStatus();
        if (statusRef.current === "complete") {
          clearInterval(statusInterval);
        }
      };
      statusInterval = setInterval(pollStatusInterval, 2000);
      if (qrCodeUrl) {
        qrInterval = setInterval(() => {
          if (mounted) {
            setQrRefreshKey(Date.now());
          }
        }, 2000);
      }
    }
    return () => {
      mounted = false;
      clearInterval(statusInterval);
      clearInterval(qrInterval);
    };
  }, [status, orderRef, qrCodeUrl, pollStatus, loginComplete]);

  return (
    <div className="space-y-6">
      {/* Initiating State */}
      {status === "initiating" && (
        <StatusDisplay status="initiating" message="Startar BankID..." />
      )}
      {/* Pending State */}
      {status === "pending" && (
        <div className="text-center space-y-4">
          {!isMobile && qrCodeUrl && (
            <QRCodeDisplay
              url={qrCodeUrl}
              refreshKey={qrRefreshKey}
              message={bankIDService.getStatusMessage()}
            />
          )}
          {isMobile && (
            <StatusDisplay status="pending" message="Öppnar BankID-appen..." />
          )}
        </div>
      )}
      {/* Complete State */}
      {status === "complete" && userData && (
        <div className="text-center">
          <div className="text-green-500 text-lg flex items-center justify-center space-x-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>BankID-legitimering klar</span>
          </div>
          <p className="text-gray-700 mt-2">
            {userData.name} ({userData.personalNumber})
          </p>
          {wpLoading ? (
            <div className="mt-4">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
              <p className="text-blue-600 mt-2">
                Verifierar WordPress-konto...
              </p>
            </div>
          ) : wpExists ? (
            <div className="mt-4">
              <p className="text-green-600">Inloggning lyckades!</p>
              <p className="text-sm text-gray-500 mt-2">
                Omdirigerar till startsidan...
              </p>
            </div>
          ) : (
            <p className="text-yellow-600 mt-2">
              Användaren saknas i WordPress. Kontakta administratören.
            </p>
          )}
          {wpError && <p className="text-red-500 mt-2">{wpError}</p>}
        </div>
      )}
      {/* Error State */}
      {(status === "failed" || status === "error") && (
        <div className="text-center space-y-4">
          <p className="text-red-500">
            {error || "Ett tekniskt fel inträffade"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Försök igen
          </button>
        </div>
      )}
      {/* Status Log */}
      <StatusLog logs={statusLog} />
    </div>
  );
}

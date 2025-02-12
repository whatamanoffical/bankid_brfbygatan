// src/lib/bankid.ts
import type {
  BankIDSignResponse,
  BankIDStatusResponse,
  BankIDSignRequest,
  BankIDStatusRequest,
  BankIDError,
  SignStatus,
  UserData,
} from "@/types/bankid";

interface BankIDConfig {
  apiUser: string;
  password: string;
  companyApiGuid: string;
}

interface APIEndpoints {
  sign: string;
  collectStatus: string;
}

// Status messages mapping
const STATUS_MESSAGES: Record<string, string> = {
  outstandingTransaction: "Väntar på att BankID-appen ska öppnas",
  noClient: "BankID-appen hittades inte. Har du installerat den?",
  started: "BankID-appen har startats. Vänligen legitimera dig.",
  userSign: "Skriv in din säkerhetskod i BankID-appen",
  expiredTransaction: "Legitimering tog för lång tid, försök igen",
  certificateErr: "Det blev fel med ditt BankID, försök igen",
  userCancel: "Du avbröt legitimeringen",
  cancelled: "Legitimeringen avbröts",
  startFailed: "BankID-appen kunde inte startas",
};

const CONFIG: BankIDConfig = {
  apiUser: process.env.NEXT_PUBLIC_BANKID_API_USER!,
  password: process.env.NEXT_PUBLIC_BANKID_PASSWORD!,
  companyApiGuid: process.env.NEXT_PUBLIC_BANKID_COMPANY_GUID!,
};

const API_ENDPOINTS: APIEndpoints = {
  sign: process.env.NEXT_PUBLIC_BANKID_SIGN_URL!,
  collectStatus: process.env.NEXT_PUBLIC_BANKID_STATUS_URL!,
};

// Validation function with better type handling
const validateConfig = (config: Record<string, unknown>): void => {
  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `❌ Missing BankID configuration: ${missingKeys.join(", ")}`
    );
  }
};

// Validate configurations using type-safe approach
validateConfig(
  Object.entries(CONFIG).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }),
    {} as Record<string, string>
  )
);

validateConfig(
  Object.entries(API_ENDPOINTS).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }),
    {} as Record<string, string>
  )
);

export class BankIDService {
  private config: BankIDConfig;
  private endpoints: APIEndpoints;
  private readonly REQUEST_TIMEOUT = 30000;
  private readonly QR_REFRESH_INTERVAL = 2000;

  constructor(config = CONFIG, endpoints = API_ENDPOINTS) {
    this.config = config;
    this.endpoints = endpoints;
  }

  private createBankIDError(
    code: string,
    message: string,
    details?: unknown
  ): BankIDError {
    const error = new Error(message) as BankIDError;
    error.code = code;
    error.details = details;
    return error;
  }

  private async makeRequest<T>(
    endpoint: string,
    payload: BankIDSignRequest | BankIDStatusRequest,
    errorPrefix: string
  ): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw this.createBankIDError(
          "HTTP_ERROR",
          `${errorPrefix}: HTTP ${response.status} - ${response.statusText}`
        );
      }

      // Validate response structure
      this.validateResponse(data, errorPrefix);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw this.createBankIDError(
            "TIMEOUT",
            `${errorPrefix}: Request timeout`
          );
        }
      }
      console.error(`${errorPrefix}:`, error);
      throw error;
    }
  }

  private validateResponse(
    response: BankIDSignResponse | BankIDStatusResponse,
    errorPrefix: string
  ): void {
    console.log("Validating response:", response); // Log the response

    if (!response.authResponse?.Success) {
      throw this.createBankIDError(
        "AUTH_ERROR",
        `${errorPrefix}: ${
          response.authResponse?.ErrorMessage || "Authentication failed"
        }`
      );
    }

    if (!response.apiCallResponse?.Success) {
      // Instead of throwing an error, log the message and return if applicable
      console.warn(
        `API call failed: ${
          response.apiCallResponse?.StatusMessage || "Unknown error"
        }`
      );
      return; // Adjust this according to your flow
    }

    // Check if the response structure is valid for complete status
    if (
      "Status" in response.apiCallResponse.Response &&
      response.apiCallResponse.Response.Status === "complete" &&
      !response.apiCallResponse.Response.CompletionData
    ) {
      throw this.createBankIDError(
        "INVALID_RESPONSE",
        `${errorPrefix}: Incomplete data for complete status`
      );
    }
  }

  async initiateSign(
    endUserIp: string,
    userVisibleData: string = "Sign in to application"
  ): Promise<BankIDSignResponse> {
    const payload: BankIDSignRequest = {
      apiUser: this.config.apiUser,
      password: this.config.password,
      companyApiGuid: this.config.companyApiGuid,
      endUserIp,
      userVisibleData,
      getQr: true,
    };

    console.log("🔄 Initiating BankID Sign:", {
      ...payload,
      password: "[REDACTED]",
    });

    try {
      const data = await this.makeRequest<BankIDSignResponse>(
        this.endpoints.sign,
        payload,
        "BankID Sign failed"
      );

      console.log("✅ BankID Sign initiated:", {
        orderRef: data.apiCallResponse?.Response?.OrderRef,
        hasQrCode: !!data.apiCallResponse?.Response?.QrImage,
      });

      return data;
    } catch (error) {
      console.error("❌ BankID Sign Error:", error);
      throw error;
    }
  }

  async collectStatus(orderRef: string): Promise<{
    status: SignStatus;
    userData?: UserData;
    hintCode?: string;
  }> {
    const payload: BankIDStatusRequest = {
      apiUser: this.config.apiUser,
      password: this.config.password,
      companyApiGuid: this.config.companyApiGuid,
      orderRef,
    };

    try {
      const response = await this.makeRequest<BankIDStatusResponse>(
        this.endpoints.collectStatus,
        payload,
        "Status check failed"
      );

      const apiResponse = response.apiCallResponse?.Response;
      const status = apiResponse?.Status;
      const hintCode = apiResponse?.HintCode;
      const completionData = apiResponse?.CompletionData;

      let signStatus: SignStatus = "pending";
      let userData: UserData | undefined;

      switch (status) {
        case "pending":
          signStatus = "pending";
          break;
        case "complete":
          signStatus = "complete";
          if (completionData?.user) {
            userData = {
              personalNumber: completionData.user.personalNumber,
              name: completionData.user.name,
              givenName: completionData.user.givenName,
              surname: completionData.user.surname,
            };
          }
          break;
        case "failed":
          signStatus = "failed";
          break;
        default:
          signStatus = "error";
      }

      console.log(`BankID Status: ${signStatus}`, {
        hintCode,
        hasUserData: !!userData,
      });

      return { status: signStatus, userData, hintCode };
    } catch (error) {
      console.error("BankID Status Error:", error);
      throw error;
    }
  }

  getAppUrl(autoStartToken: string, returnUrl: string): string {
    const userAgent =
      typeof window !== "undefined" ? window.navigator.userAgent : "";
    const isModernPlatform =
      /Android 6|Android [7-9]|Android [1-9][0-9]|iOS|iPhone|iPad|iPod/.test(
        userAgent
      );

    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const baseUrl = isModernPlatform ? "https://app.bankid.com/" : "bankid:///";

    return `${baseUrl}?autostarttoken=${autoStartToken}&redirect=${encodedReturnUrl}`;
  }

  getQrCodeUrl(qrUrl: string): string {
    if (!qrUrl) {
      throw this.createBankIDError("INVALID_QR_URL", "QR URL is required");
    }
    return `${qrUrl}?t=${Date.now()}`;
  }

  getStatusMessage(hintCode?: string): string {
    return STATUS_MESSAGES[hintCode || ""] || "Väntar på BankID...";
  }
}

// Export singleton instance
export const bankIDService = new BankIDService();

// Export types for testing
export type { BankIDConfig, APIEndpoints };

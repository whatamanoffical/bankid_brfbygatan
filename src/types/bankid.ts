// src/types/bankid.ts

// Common Types
export type SignStatus =
  | "initiating"
  | "pending"
  | "complete"
  | "failed"
  | "error";

export interface BankIDUser {
  personalNumber: string;
  name: string;
  givenName: string;
  surname: string;
}

export interface CompletionData {
  user: BankIDUser;
}

export interface BankIDResponse {
  OrderRef: string;
  Status: "pending" | "complete" | "failed";
  HintCode?: string;
  CompletionData?: CompletionData;
}

export interface UserData {
  personalNumber: string;
  name: string;
  givenName: string;
  surname: string;
}

// BankID API Types
export interface BankIDSignRequest {
  apiUser: string;
  password: string;
  companyApiGuid: string;
  endUserIp: string;
  userVisibleData?: string;
  userNonVisibleData?: string;
  getQr: boolean;
}

export interface BankIDSignResponse {
  authResponse: {
    Success: boolean;
    ErrorMessage: string | null;
  };
  apiCallResponse: {
    Success: boolean;
    StatusMessage: string;
    Response: {
      OrderRef: string;
      AutoStartToken: string;
      QrImage?: string;
    };
  } | null;
}

export interface BankIDStatusRequest {
  apiUser: string;
  password: string;
  companyApiGuid: string;
  orderRef: string;
}

export interface BankIDStatusResponse {
  authResponse: {
    Success: boolean;
    ErrorMessage: string | null;
  };
  apiCallResponse: {
    Success: boolean;
    StatusMessage: string;
    Response: {
      OrderRef: string;
      Status: "pending" | "complete" | "failed";
      HintCode?: string;
      CompletionData?: {
        user: {
          personalNumber: string;
          name: string;
          givenName: string;
          surname: string;
        };
      };
    };
  };
}

// Component Props Types
export interface BankIDFlowProps {
  onError?: (error: unknown) => void;
}

export interface StatusDisplayProps {
  status: SignStatus | string;
  message: string;
}

export interface QRCodeDisplayProps {
  url: string;
  refreshKey: number;
  message: string;
}

export interface StatusLogProps {
  logs: string[];
}

// Hook Types
export interface BankIDSignHookResult {
  orderRef: string | null;
  qrCodeUrl: string | null;
  error: string | null;
  startSign: () => Promise<{
    orderRef: string;
    autoStartToken?: string;
    qrCodeUrl?: string;
  }>;
}

export interface BankIDStatusHookResult {
  status: string;
  userData: UserData | null;
  error: string | null;
  checkStatus: (orderRef: string) => Promise<StatusResponse>;
}

export interface StatusResponse {
  status: string;
  userData?: UserData;
  hintCode?: string;
}

// WordPress Types
export interface WordPressUser {
  ID: number;
  email: string;
  user_login: string;
  display_name: string;
}

export interface WordPressAuthHookResult {
  wpExists: boolean | null;
  checkAndLoginUser: (userData: UserData) => Promise<boolean>;
}

export interface WordPressCheckResponse {
  success: boolean;
  message: string;
  user?: WordPressUser;
}
export interface WordPressLoginResponse {
  success: boolean;
  message: string;
  user?: WordPressUser;
}

export interface WordPressError {
  code: string;
  message: string;
  data?: {
    status: number;
    error?: {
      type: number;
      message: string;
      file?: string;
      line?: number;
    };
  };
}

// Error Types
export interface BankIDError extends Error {
  code: string;
  details?: unknown;
}

export interface WordPressError extends Error {
  code: string;
  details?: unknown;
}

// Message Types
export type ParentMessage = {
  type: "BANKID_LOGIN_SUCCESS" | "BANKID_LOGIN_ERROR" | "BANKID_USER_NOT_FOUND";
  data: Record<string, unknown>;
};

// Configuration Types
export interface BankIDConfig {
  apiUrl: string;
  refreshInterval: number;
  maxRetries: number;
  statusMessages: Record<string, string>;
}

export interface WordPressConfig {
  apiUrl: string;
  siteUrl: string;
}

// Environment Types
export interface Environment {
  NEXT_PUBLIC_WORDPRESS_API_URL: string;
  NEXT_PUBLIC_WORDPRESS_SITE_URL: string;
  BANKID_API_URL: string;
  BANKID_API_KEY: string;
  BANKID_API_USER: string;
  BANKID_API_PASSWORD: string;
  BANKID_COMPANY_GUID: string;
}

// Utility Types
export type Optional<T> = T | null;
export type AsyncResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: Error;
}>;

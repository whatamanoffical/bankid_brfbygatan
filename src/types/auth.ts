// src/types/auth.ts
import { BankIDUser, WordPressUser } from "./bankid";

export interface AuthFlowResult {
  bankid: {
    success: boolean;
    userData?: BankIDUser;
    error?: string;
  };
  wordpress: {
    success: boolean;
    user?: WordPressUser;
    error?: string;
  };
}

export interface ParentFrameMessage {
  type: "BANKID_LOGIN_SUCCESS" | "BANKID_LOGIN_ERROR";
  data: {
    personalNumber?: string;
    name?: string;
    wpUser?: WordPressUser;
    error?: string;
  };
}

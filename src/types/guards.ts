// src/types/guards.ts
import { UserData, WordPressUser, BankIDError, WordPressError } from "./bankid";

export function isUserData(data: unknown): data is UserData {
  if (!data || typeof data !== "object") return false;

  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.personalNumber === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.givenName === "string" &&
    typeof candidate.surname === "string"
  );
}

export function isWordPressUser(data: unknown): data is WordPressUser {
  if (!data || typeof data !== "object") return false;

  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string"
  );
}

export function isBankIDError(error: unknown): error is BankIDError {
  if (!(error instanceof Error)) return false;

  const candidate = error as Error & Record<string, unknown>;

  return "code" in candidate && typeof candidate.code === "string";
}

export function isWordPressError(error: unknown): error is WordPressError {
  if (!(error instanceof Error)) return false;

  const candidate = error as Error & Record<string, unknown>;

  return "code" in candidate && typeof candidate.code === "string";
}

// Helper function to ensure object type
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Helper function to check if a property exists and has the correct type
export function hasProperty<T>(
  obj: Record<string, unknown>,
  prop: string,
  type: "string" | "number" | "boolean"
): obj is Record<string, T> {
  return prop in obj && typeof obj[prop] === type;
}

// src/utils/validation.ts
import { UserData, WordPressUser } from "@/types/bankid";
import { isUserData, isWordPressUser } from "@/types/guards";

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateUserData(data: unknown): UserData {
  if (!isUserData(data)) {
    throw new ValidationError("Invalid user data structure");
  }

  if (data.personalNumber.length !== 12) {
    throw new ValidationError(
      "Personal number must be 12 digits",
      "personalNumber"
    );
  }

  if (data.name.length < 2) {
    throw new ValidationError(
      "Name must be at least 2 characters long",
      "name"
    );
  }

  return data;
}
export function validateWordPressUser(data: unknown): WordPressUser {
  if (!isWordPressUser(data)) {
    throw new ValidationError("Invalid WordPress user structure");
  }

  if (data.ID <= 0) {
    // Change 'id' to 'ID'
    throw new ValidationError("User ID must be a positive number", "ID"); // Change 'id' to 'ID'
  }

  if (!data.email.includes("@")) {
    throw new ValidationError("Invalid email format", "email");
  }

  return data;
}

export function safeParseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new ValidationError("Invalid JSON format");
  }
}

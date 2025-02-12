export class BankIDError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    // Changed unknown to Record<string, any>
    super(message);
    this.name = "BankIDError";
  }
}

export class WordPressError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    // Changed unknown to Record<string, any>
    super(message);
    this.name = "WordPressError";
  }
}

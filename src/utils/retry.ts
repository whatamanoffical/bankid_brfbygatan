// src/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options = {
    retries: 3,
    delay: 1000,
  }
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < options.retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, options.delay));
      }
    }
  }

  throw lastError!;
}

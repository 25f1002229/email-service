export async function exponentialBackoff(attempt: number, base = 100): Promise<void> {
  const delay = Math.pow(2, attempt) * base;
  return new Promise(res => setTimeout(res, delay));
}

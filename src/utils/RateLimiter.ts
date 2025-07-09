export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(private rate: number, private perMs: number) {
    this.tokens = rate;
    this.lastRefill = Date.now();
  }

  consume(): boolean {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const refill = Math.floor(elapsed / this.perMs) * this.rate;
    if (refill > 0) {
      this.tokens = Math.min(this.tokens + refill, this.rate);
      this.lastRefill = now;
    }
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
}

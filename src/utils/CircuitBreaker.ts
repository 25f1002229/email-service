export class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private openedAt = 0;

  constructor(private threshold = 3, private timeout = 10000) {}

  async exec(fn: () => Promise<void>): Promise<void> {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit open');
      }
    }
    try {
      await fn();
      this.failures = 0;
      this.state = 'closed';
    } catch (e) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state = 'open';
        this.openedAt = Date.now();
      }
      throw e;
    }
  }
}

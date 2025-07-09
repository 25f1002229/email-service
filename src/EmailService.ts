import { Email, EmailStatus, EmailProvider } from './types';
import { exponentialBackoff } from './utils/ExponentialBackoff';
import { RateLimiter } from './utils/RateLimiter';
import { CircuitBreaker } from './utils/CircuitBreaker';
import { Logger } from './utils/Logger';
import { Queue } from './utils/Queue';

export class EmailService {
  private providers: EmailProvider[];
  private rateLimiter = new RateLimiter(5, 1000); // 5 emails/sec
  private statusMap = new Map<string, EmailStatus>();
  private sentEmails = new Set<string>(); // For idempotency
  private queue = new Queue<Email>();
  private circuitBreakers: Map<string, CircuitBreaker>;

  constructor(providers: EmailProvider[]) {
    this.providers = providers;
    this.circuitBreakers = new Map(
      providers.map(p => [p.name, new CircuitBreaker()])
    );
  }

  async send(email: Email): Promise<EmailStatus> {
    // Idempotency: If already attempted, return the stored status (do not increment attempts)
    if (this.statusMap.has(email.id)) {
      return this.statusMap.get(email.id)!;
    }
    if (!this.rateLimiter.consume()) {
      this.queue.enqueue(email);
      this.statusMap.set(email.id, { id: email.id, status: 'queued', attempts: 0 });
      Logger.log(`Rate limit exceeded, queued email ${email.id}`);
      return this.statusMap.get(email.id)!;
    }
    let attempts = 0;
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      const breaker = this.circuitBreakers.get(provider.name)!;
      while (attempts < 3) {
        try {
          await breaker.exec(() => provider.send(email));
          this.sentEmails.add(email.id);
          const status: EmailStatus = {
            id: email.id,
            status: 'sent',
            attempts: attempts + 1,
            lastProvider: provider.name
          };
          this.statusMap.set(email.id, status);
          Logger.log(`Email ${email.id} sent via ${provider.name}`);
          return status;
        } catch (e) {
          attempts++;
          this.statusMap.set(email.id, {
            id: email.id,
            status: 'retrying',
            attempts,
            lastProvider: provider.name,
            error: (e as Error).message
          });
          Logger.log(`Attempt ${attempts} failed on ${provider.name}: ${(e as Error).message}`);
          await exponentialBackoff(attempts);
        }
      }
      Logger.log(`Switching to next provider for email ${email.id}`);
    }
    const status: EmailStatus = {
      id: email.id,
      status: 'failed',
      attempts,
      error: 'All providers failed'
    };
    this.statusMap.set(email.id, status);
    Logger.log(`Email ${email.id} failed with all providers`);
    return status;
  }

  getStatus(emailId: string): EmailStatus | undefined {
    return this.statusMap.get(emailId);
  }

  // Make processQueue async and await all sends
  async processQueue() {
    while (!this.queue.isEmpty() && this.rateLimiter.consume()) {
      const email = this.queue.dequeue()!;
      await this.send(email);
    }
  }
}

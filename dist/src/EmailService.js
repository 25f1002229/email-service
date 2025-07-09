"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const ExponentialBackoff_1 = require("./utils/ExponentialBackoff");
const RateLimiter_1 = require("./utils/RateLimiter");
const CircuitBreaker_1 = require("./utils/CircuitBreaker");
const Logger_1 = require("./utils/Logger");
const Queue_1 = require("./utils/Queue");
class EmailService {
    constructor(providers) {
        this.rateLimiter = new RateLimiter_1.RateLimiter(5, 1000); // 5 emails/sec
        this.statusMap = new Map();
        this.sentEmails = new Set(); // For idempotency
        this.queue = new Queue_1.Queue();
        this.providers = providers;
        this.circuitBreakers = new Map(providers.map(p => [p.name, new CircuitBreaker_1.CircuitBreaker()]));
    }
    async send(email) {
        // Idempotency: If already attempted, return the stored status (do not increment attempts)
        if (this.statusMap.has(email.id)) {
            return this.statusMap.get(email.id);
        }
        if (!this.rateLimiter.consume()) {
            this.queue.enqueue(email);
            this.statusMap.set(email.id, { id: email.id, status: 'queued', attempts: 0 });
            Logger_1.Logger.log(`Rate limit exceeded, queued email ${email.id}`);
            return this.statusMap.get(email.id);
        }
        let attempts = 0;
        for (let i = 0; i < this.providers.length; i++) {
            const provider = this.providers[i];
            const breaker = this.circuitBreakers.get(provider.name);
            while (attempts < 3) {
                try {
                    await breaker.exec(() => provider.send(email));
                    this.sentEmails.add(email.id);
                    const status = {
                        id: email.id,
                        status: 'sent',
                        attempts: attempts + 1,
                        lastProvider: provider.name
                    };
                    this.statusMap.set(email.id, status);
                    Logger_1.Logger.log(`Email ${email.id} sent via ${provider.name}`);
                    return status;
                }
                catch (e) {
                    attempts++;
                    this.statusMap.set(email.id, {
                        id: email.id,
                        status: 'retrying',
                        attempts,
                        lastProvider: provider.name,
                        error: e.message
                    });
                    Logger_1.Logger.log(`Attempt ${attempts} failed on ${provider.name}: ${e.message}`);
                    await (0, ExponentialBackoff_1.exponentialBackoff)(attempts);
                }
            }
            Logger_1.Logger.log(`Switching to next provider for email ${email.id}`);
        }
        const status = {
            id: email.id,
            status: 'failed',
            attempts,
            error: 'All providers failed'
        };
        this.statusMap.set(email.id, status);
        Logger_1.Logger.log(`Email ${email.id} failed with all providers`);
        return status;
    }
    getStatus(emailId) {
        return this.statusMap.get(emailId);
    }
    // Make processQueue async and await all sends
    async processQueue() {
        while (!this.queue.isEmpty() && this.rateLimiter.consume()) {
            const email = this.queue.dequeue();
            await this.send(email);
        }
    }
}
exports.EmailService = EmailService;

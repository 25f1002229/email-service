"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
class CircuitBreaker {
    constructor(threshold = 3, timeout = 10000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failures = 0;
        this.state = 'closed';
        this.openedAt = 0;
    }
    async exec(fn) {
        if (this.state === 'open') {
            if (Date.now() - this.openedAt > this.timeout) {
                this.state = 'half-open';
            }
            else {
                throw new Error('Circuit open');
            }
        }
        try {
            await fn();
            this.failures = 0;
            this.state = 'closed';
        }
        catch (e) {
            this.failures++;
            if (this.failures >= this.threshold) {
                this.state = 'open';
                this.openedAt = Date.now();
            }
            throw e;
        }
    }
}
exports.CircuitBreaker = CircuitBreaker;

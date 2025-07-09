"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor(rate, perMs) {
        this.rate = rate;
        this.perMs = perMs;
        this.tokens = rate;
        this.lastRefill = Date.now();
    }
    consume() {
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
exports.RateLimiter = RateLimiter;

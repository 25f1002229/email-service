"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderA = void 0;
class ProviderA {
    constructor() {
        this.name = 'ProviderA';
    }
    async send(email) {
        // Simulate random failure (70% failure rate)
        if (Math.random() < 0.7) {
            throw new Error('ProviderA failed');
        }
        // Simulate sending delay
        await new Promise(res => setTimeout(res, 100));
    }
}
exports.ProviderA = ProviderA;

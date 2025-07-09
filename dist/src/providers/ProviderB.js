"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderB = void 0;
class ProviderB {
    constructor() {
        this.name = 'ProviderB';
    }
    async send(email) {
        // Simulate random failure (50% failure rate)
        if (Math.random() < 0.5) {
            throw new Error('ProviderB failed');
        }
        // Simulate sending delay
        await new Promise(res => setTimeout(res, 100));
    }
}
exports.ProviderB = ProviderB;

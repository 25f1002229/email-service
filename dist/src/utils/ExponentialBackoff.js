"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exponentialBackoff = exponentialBackoff;
async function exponentialBackoff(attempt, base = 100) {
    const delay = Math.pow(2, attempt) * base;
    return new Promise(res => setTimeout(res, delay));
}

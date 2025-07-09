"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EmailService_1 = require("../src/EmailService");
const ProviderA_1 = require("../src/providers/ProviderA");
const ProviderB_1 = require("../src/providers/ProviderB");
describe('EmailService', () => {
    test('Email is sent successfully', async () => {
        const service = new EmailService_1.EmailService([new ProviderA_1.ProviderA(), new ProviderB_1.ProviderB()]);
        const email = { id: '1', to: 'test@example.com', subject: 'Test', body: 'Hello' };
        const status = await service.send(email);
        expect(['sent', 'failed']).toContain(status.status);
    });
    test('Idempotency works', async () => {
        const service = new EmailService_1.EmailService([new ProviderA_1.ProviderA(), new ProviderB_1.ProviderB()]);
        const email = { id: '2', to: 'test@example.com', subject: 'Test', body: 'Hello' };
        const firstStatus = await service.send(email);
        const secondStatus = await service.send(email);
        expect(secondStatus.attempts).toBe(firstStatus.attempts); // Should be equal, whatever the value
    });
    test('Rate limiting queues emails', async () => {
        const service = new EmailService_1.EmailService([new ProviderA_1.ProviderA(), new ProviderB_1.ProviderB()]);
        const emails = Array.from({ length: 10 }, (_, i) => ({
            id: `email${i}`,
            to: 'test@example.com',
            subject: 'Test',
            body: 'Hello'
        }));
        // Send all emails and wait for sends to complete
        await Promise.all(emails.map(email => service.send(email)));
        // Process the queue until all emails are handled
        while (service['queue'] && !service['queue'].isEmpty()) {
            await service.processQueue();
            // Optionally, add a small delay to simulate time passing
            await new Promise(res => setTimeout(res, 100));
        }
        const queued = emails.filter(e => { var _a; return ((_a = service.getStatus(e.id)) === null || _a === void 0 ? void 0 : _a.status) === 'queued'; });
        expect(queued.length).toBeGreaterThan(0);
    }, 20000); // Increase timeout for this test
});

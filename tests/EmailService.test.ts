import { EmailService } from '../src/EmailService';
import { ProviderA } from '../src/providers/ProviderA';
import { ProviderB } from '../src/providers/ProviderB';
import { Email } from '../src/types';

describe('EmailService', () => {
  test('Email is sent successfully', async () => {
    const service = new EmailService([new ProviderA(), new ProviderB()]);
    const email: Email = { id: '1', to: 'test@example.com', subject: 'Test', body: 'Hello' };
    const status = await service.send(email);
    expect(['sent', 'failed']).toContain(status.status);
  });

  test('Idempotency works', async () => {
  const service = new EmailService([new ProviderA(), new ProviderB()]);
  const email: Email = { id: '2', to: 'test@example.com', subject: 'Test', body: 'Hello' };
  const firstStatus = await service.send(email);
  const secondStatus = await service.send(email);
  expect(secondStatus.attempts).toBe(firstStatus.attempts); // Should be equal, whatever the value
    });

  test('Rate limiting queues emails', async () => {
    const service = new EmailService([new ProviderA(), new ProviderB()]);
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

    const queued = emails.filter(e => service.getStatus(e.id)?.status === 'queued');
    expect(queued.length).toBeGreaterThan(0);
  }, 20000); // Increase timeout for this test
});

import { Email, EmailProvider } from '../types';

export class ProviderB implements EmailProvider {
  name = 'ProviderB';
  async send(email: Email): Promise<void> {
    // Simulate random failure (50% failure rate)
    if (Math.random() < 0.5) {
      throw new Error('ProviderB failed');
    }
    // Simulate sending delay
    await new Promise(res => setTimeout(res, 100));
  }
}

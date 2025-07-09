import { Email, EmailProvider } from '../types';

export class ProviderA implements EmailProvider {
  name = 'ProviderA';
  async send(email: Email): Promise<void> {
    // Simulate random failure (70% failure rate)
    if (Math.random() < 0.7) {
      throw new Error('ProviderA failed');
    }
    // Simulate sending delay
    await new Promise(res => setTimeout(res, 100));
  }
}

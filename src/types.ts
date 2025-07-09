export interface Email {
  id: string; // Unique for idempotency
  to: string;
  subject: string;
  body: string;
}

export interface EmailStatus {
  id: string;
  status: 'pending' | 'sent' | 'failed' | 'retrying' | 'queued';
  attempts: number;
  lastProvider?: string;
  error?: string;
}

export interface EmailProvider {
  name: string;
  send(email: Email): Promise<void>;
}

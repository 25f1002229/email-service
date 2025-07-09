import { VercelRequest, VercelResponse } from '@vercel/node';
import { EmailService } from '../src/EmailService';
import { ProviderA } from '../src/providers/ProviderA';
import { ProviderB } from '../src/providers/ProviderB';

const service = new EmailService([new ProviderA(), new ProviderB()]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id, to, subject, body } = req.body;
  if (!id || !to || !subject || !body) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const status = await service.send({ id, to, subject, body });
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

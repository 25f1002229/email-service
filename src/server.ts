import express from 'express';
import { EmailService } from './EmailService';
import { ProviderA } from './providers/ProviderA';
import { ProviderB } from './providers/ProviderB';

const app = express();
const port = process.env.PORT || 3000;

const axios = require('axios');
const url = 'https://email-service-vishaljituri.onrender.com/';
setInterval(() => axios.get(url), 14 * 60 * 1000);

app.use(express.json());

const service = new EmailService([new ProviderA(), new ProviderB()]);

app.get('/health', (_req, res) => {
  res.json({ message: 'backend is working' });
});

app.post('/send', async (req, res) => {
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
});

app.get('/', (_req, res) => {
  res.send('Email Service backend is running.');
});

app.listen(port, () => {
  console.log(`Email Service API running on port ${port}`);
});

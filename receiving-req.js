import express from 'express';
import { embeddingQueue } from './lib/queue.js';

const app = express();
app.use(express.json());

app.post('/api/embed', async (req, res) => {
  const { text , serviceId , collection} = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  if (!serviceId) return res.status(400).json({ error: 'servecID is required' });
  if (!collection) return res.status(400).json({ error: 'collection is required' });

  try {
    await embeddingQueue.add('createEmbedding', { text , serviceId ,collection});
    res.json({ message: 'Job added to queue' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add job' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { createWorker } from './lib/queue.js';
import { generateEmbedding } from './utils/embedding.js';

dotenv.config();
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db('village');
// const collection_providingservices = db.collection('providingservices');  

// تشغيل الـ worker
createWorker(async ({ text , serviceId , collection}) => {
  if (!text) throw new Error('Text is required');
  if (!serviceId) throw new Error('servecID is required');
  if (!collection) throw new Error('servecID is collection');
  const embedding = await generateEmbedding(text);

  // حفظ الـ vector في قاعدة البيانات
  const collection_ = db.collection(collection);
  await collection_.updateOne(
    { _id: ObjectId.createFromHexString(serviceId) },
    { $set: { embedding } }
  );
  console.log('✅ Job done:',serviceId, embedding.slice(0, 5), '...'); // جزء من الـ vector
  return embedding;
});

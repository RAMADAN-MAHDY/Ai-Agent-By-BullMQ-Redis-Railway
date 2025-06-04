import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { createWorker , getQueueStats} from './lib/queue.js';
import { generateEmbedding } from './utils/embedding.js';
import cron from 'node-cron';

dotenv.config();
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db('village');
// const collection_providingservices = db.collection('providingservices');  
const statsCollection = db.collection('queueStats');

// 🕛 جدولة المهمة يوميًا عند منتصف الليل بتوقيت القاهرة
cron.schedule('13 0 * * *', async () => {

const today = new Date().toISOString().split('T')[0]; // الحصول على تاريخ اليوم
const jobCountsNow = await getQueueStats(); // الحصول على إحصائيات اليوم الحالي

console.log('📊 إحصائيات الطابور:', jobCountsNow);
    // 🔍 الحصول على إحصائيات اليوم السابق
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const previousStats = await statsCollection.findOne({ date: yesterdayStr }) || { jobCounts: {} };

 // 🧮 حساب الفرق بين اليوم الحالي واليوم السابق
 const dailyStats = {};
 for (const key in jobCountsNow) {
     dailyStats[key] = jobCountsNow[key] - (previousStats.jobCounts[key] || 0);
 }

 await statsCollection.insertOne({
    date: today,
    jobCounts: jobCountsNow,
    dailyStats
});


console.log(`📅 تم حفظ إحصائيات يوم ${today}:`, dailyStats);
}, {
    timezone: "Africa/Cairo"
});


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

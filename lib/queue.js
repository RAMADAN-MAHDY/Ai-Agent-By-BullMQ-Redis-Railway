import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // 🛠️ ده بيحل مشكلة BullMQ
});

// إنشاء طابور
export const embeddingQueue = new Queue('embedding', { connection });

// إنشاء ووركر
export const createWorker = (processFunction) => {
    return new Worker(
        'embedding',
        async (job) => {

            if (job.name === 'createEmbedding') {
                return await processFunction(job.data);
                // معالجة مهمة createEmbedding
            } else if (job.name === 'otherJob') {
                // معالجة مهمة أخرى 
            }
        },
        {
            connection,
            limiter: {
                max: 5, // عدد المهمات المسموح بها في الوقت الحالي
                duration: 60_000, // مدة المهمة المسموح بها بالمللي ثانية
            }
        }
    );
};

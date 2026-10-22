import "dotenv/config";
import { Worker } from 'bullmq';
import { createRedisConnection } from './queue.redis.js';
import { sendMail } from '../service/nodemailer.service.js';

const worker = new Worker(
  'email-queue',
  async (job) => {
    console.log(`Processing job ${job.id} (${job.name})`);
    if (job.name === 'email-queue') {
      await sendMail(job.data.sendTo, job.data.subject, job.data.text, job.data.html);
    }
  },
  { connection: createRedisConnection() }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed.`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

export { worker };
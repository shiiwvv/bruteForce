import "dotenv/config";
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { redisUrl } from '../src/constants.js';

const redisOptions = {
  maxRetriesPerRequest: null,
};

console.log("RedisUrl: " , redisUrl);

const queueConnection = new Redis(redisUrl , redisOptions);

const welcomeQueueWorkerConnection = () => new Redis(redisUrl , redisOptions);
const cronQueueWorkerConnection = () => new Redis(redisUrl , redisOptions);
const taskQueueWorkerConnection = () => new Redis(redisUrl , redisOptions);


const emailQueue = new Queue('email-queue', { connection: queueConnection });
const cronQueue = new Queue('cron-queue', { connection: queueConnection });
const taskQueue = new Queue('task-queue', { connection: queueConnection });

await cronQueue.add('cron-queue', {}, { repeat: { cron: '30 5 * * *' } });

export { emailQueue, cronQueue, taskQueue, welcomeQueueWorkerConnection , cronQueueWorkerConnection, taskQueueWorkerConnection };
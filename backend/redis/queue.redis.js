import "dotenv/config";
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { redisUrl } from '../src/constants.js';

const redisOptions = {
  maxRetriesPerRequest: null,
};

const queueConnection = new Redis(redisUrl , redisOptions);

const createRedisConnection = () => new Redis(redisUrl , redisOptions);

const queue = new Queue('email-queue', { connection: queueConnection });

export { queue, createRedisConnection };
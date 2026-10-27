import "dotenv/config";
import { Worker } from "bullmq";
import {
  welcomeQueueWorkerConnection,
  cronQueueWorkerConnection,
  taskQueueWorkerConnection,
  taskQueue,
} from "./queue.redis.js";
import { sendMail } from "../service/nodemailer.service.js";
import { Problem } from "../src/models/problem.model.js";
import { User } from "../src/models/user.model.js";
import {customMessages , customSubjects} from "../src/constants.js";

const redisReminderFormatter = (user) => {
  const messages = customMessages(user.userDetails.username , user.totalCount); 
  const subjects = customSubjects(user.userDetails.username , user.totalCount);
      
  const randomIndexMessage = Math.floor(Math.random() * messages.length);
  const randomIndexSubject = Math.floor(Math.random() * subjects.length);
  return {
    name: "send-reminder-email",
    data: {
      userId: user.userDetails._id,
      sendTo: user.userDetails.email,
      subject: subjects[randomIndexSubject],
      text: messages[randomIndexMessage],
      html: null,
    },
    opts: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  };
};

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log(`Processing job ${job.id} (${job.name})`);
    const result = await sendMail(
      job.data.sendTo,
      job.data.subject,
      job.data.text,
      job.data.html,
    );
    console.log(`Email sent to ${job.data.sendTo}: ${result}`);
    if (!result) {
      throw new Error("Failed to send email");
    }

    return { status: "Delivered" };
  },
  {
    connection: welcomeQueueWorkerConnection(),
    concurrency: 10,
  },
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed.`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

const cronWorker = new Worker(
  "cron-queue",
  async (job) => {
    console.log("Pushing Jobs to taskWorker");
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const problems = await Problem.aggregate([
      {
        $match: {
          solved: false,
          reminderTime: { $lte: endOfDay },
          $or: [
            { lastRemindedAt: null },
            { lastRemindedAt: { $lt: startOfDay } },
          ],
        },
      },
      {
        $group: {
          _id: "$owner",
          problemsToSolve: {
            $push: { title: "$title", link: "$link" },
          },
          totalCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
          pipeline: [
            {
              $project: {
                username: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$userDetails",
      },
    ]).cursor();

    let BATCH_SIZE = 10;
    let currentBatch = [];

    for await (const userDoc of problems) {
      currentBatch.push(userDoc);

      if (currentBatch.length === BATCH_SIZE) {
        const jobs = currentBatch.map((user) => {
          return redisReminderFormatter(user);
        });

        await taskQueue.addBulk(jobs);

        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      const jobs = await Promise.all(currentBatch.map((user) => {
        return redisReminderFormatter(user);
      }));

      await taskQueue.addBulk(jobs);
    }
  },
  {
    connection: cronQueueWorkerConnection(),
  },
);

const taskWorker = new Worker(
  "task-queue", 
  async (job) => {
    console.log(`Processing job ${job.id} for User ID: ${job.data.userId}`);

    const userProblems = await Problem.findOne({ owner: job.data.userId, solved: false });
    if (userProblems && userProblems.lastRemindedAt >= new Date(new Date().setHours(0,0,0,0))) {
      console.log(`Skipping: User ${job.data.userId} already received a reminder today.`);
      return { status: "Skipped - Already sent today" };
    }

    const result = await sendMail(
      job.data.sendTo,
      job.data.subject,
      job.data.text,
      job.data.html
    );
    
    if (!result) {
      throw new Error("Failed to send email");
    }

    await Problem.updateMany(
      { owner: job.data.userId, solved: false },
      { $set: { lastRemindedAt: new Date() } }
    );

    console.log(`Successfully emailed ${job.data.sendTo} and updated database.`);
    return { status: "Delivered" };
  },
  {
    connection: taskQueueWorkerConnection(),
    concurrency: 10,
  },
);

taskWorker.on("completed", (job) => {
  console.log(`✅(Reminder) Job ${job.id} completed.`);
});

taskWorker.on("failed", (job, err) => {
  console.error(`❌(Reminder) Job ${job?.id} failed: ${err.message}`);
});

export { worker, cronWorker, taskWorker };

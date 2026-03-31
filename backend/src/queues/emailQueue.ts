import {Queue} from "bullmq";
import {redisConfig} from "../config/redis";

export const emailQueue = new Queue("email-queue", {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const addEmailJob = async (name: string, data: any) => {
  await emailQueue.add(name, data);
  return;
};

/**
   * Enterprise BullMQ & Redis Queue Architecture Simulation
   * 
   * In a live production cluster with Redis, this service integrates 'bullmq':
   * const { Queue, Worker } = require('bullmq');
   * const emailQueue = new Queue('EmailQueue', { connection: redisConnection });
   * 
   * To prevent app crash in environments without Redis, we simulate job queueing,
   * providing a clean, plug-and-play pattern for Redis/BullMQ.
   */

class QueueService {
  constructor() {
    this.jobs = [];
  }

  /**
   * Enqueue a job into async background worker threads.
   */
  async addJob(queueName, jobName, data) {
    const job = {
      id: Math.random().toString(36).substring(7),
      queueName,
      jobName,
      data,
      status: 'queued',
      createdAt: new Date()
    };

    this.jobs.push(job);
    console.log(`[BullMQ Simulation] [Queue: ${queueName}] Enqueued job '${jobName}' (ID: ${job.id})`);

    // Process job asynchronously to simulate a background worker
    setTimeout(() => {
      this.processJob(job);
    }, 1000);

    return job;
  }

  async processJob(job) {
    job.status = 'active';
    console.log(`[BullMQ Worker] Processing job '${job.jobName}' (ID: ${job.id}) on queue '${job.queueName}'`);
    
    try {
      switch (job.queueName) {
        case 'EmailQueue':
          console.log(`[Email Service] Sending automated email notify-alert to: ${job.data.to}. Subject: ${job.data.subject}`);
          break;
        case 'NotificationQueue':
          console.log(`[Notification Service] Dispatching active websocket alerts for User ${job.data.userId}: ${job.data.message}`);
          break;
        case 'WebhookQueue':
          console.log(`[Webhook Service] Firing payload to endpoint ${job.data.url}. Attempt 1/3.`);
          break;
        default:
          console.log(`[BullMQ Worker] No worker registered for queue '${job.queueName}'`);
      }
      job.status = 'completed';
      job.completedAt = new Date();
      console.log(`[BullMQ Worker] Successfully completed job '${job.jobName}' (ID: ${job.id})`);
    } catch (err) {
      job.status = 'failed';
      job.error = err.message;
      console.error(`[BullMQ Worker] Job failed: ${err.message}`);
    }
  }

  getJobs() {
    return this.jobs;
  }
}

module.exports = new QueueService();

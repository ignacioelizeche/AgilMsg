import { Queue, Worker } from 'bullmq';
import { prisma } from '@agilmsg/database';

const connection = { host: 'redis', port: 6379 };

// ─── Queues ─────────────────────────────────────────────────
export const webhookQueue = new Queue('webhook-events', { connection });
export const billingQueue = new Queue('billing-calc', { connection });

// ─── Webhook Processor ──────────────────────────────────────
const webhookWorker = new Worker('webhook-events', async (job) => {
  const { wabaId, eventField, payload } = job.data;

  console.log(`Processing webhook: ${eventField} for WABA ${wabaId}`);

  // Mark as processed
  await prisma.webhookEvent.updateMany({
    where: { wabaId, status: 'received' },
    data: { status: 'processed' },
  });

  return { processed: true };
}, { connection, concurrency: 5 });

webhookWorker.on('completed', (job) => {
  console.log(`Webhook job ${job.id} completed`);
});

webhookWorker.on('failed', (job, err) => {
  console.error(`Webhook job ${job?.id} failed:`, err.message);
});

// ─── Billing Processor ──────────────────────────────────────
const billingWorker = new Worker('billing-calc', async (job) => {
  const { organizationId, month, year } = job.data;

  console.log(`Calculating billing for org ${organizationId}, ${year}-${month}`);

  // Count messages by category for the month
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const messages = await prisma.message.groupBy({
    by: ['billingCategory'],
    where: {
      waba: { organizationId },
      direction: 'OUTBOUND',
      billingCategory: { not: null },
      timestamp: { gte: start, lt: end },
    },
    _count: true,
    _sum: { cost: true },
  });

  // Upsert usage records
  for (const m of messages) {
    if (!m.billingCategory) continue;
    await prisma.usageRecord.upsert({
      where: {
        organizationId_year_month_messageType: {
          organizationId,
          year,
          month,
          messageType: m.billingCategory,
        },
      },
      create: {
        organizationId,
        year,
        month,
        messageType: m.billingCategory,
        count: m._count,
        cost: m._sum.cost || 0,
      },
      update: {
        count: m._count,
        cost: m._sum.cost || 0,
      },
    });
  }

  return { calculated: true, categories: messages.length };
}, { connection, concurrency: 1 });

billingWorker.on('completed', (job) => {
  console.log(`Billing job ${job.id} completed`);
});

billingWorker.on('failed', (job, err) => {
  console.error(`Billing job ${job?.id} failed:`, err.message);
});

console.log('🔄 AgilMsg Worker started');
console.log('   Queues: webhook-events, billing-calc');

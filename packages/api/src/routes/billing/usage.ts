import { FastifyInstance } from 'fastify';
import prisma from '../../../database/src/client';

export async function billingRoutes(app: FastifyInstance) {
  // Get usage for current month
  app.get('/api/billing/usage', { preHandler: [app.authenticate] }, async (request: any) => {
    const { organizationId } = request.user;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const records = await prisma.usageRecord.findMany({
      where: {
        organizationId,
        month,
        year,
      },
    });

    const totalCost = records.reduce((sum, r) => sum + Number(r.cost), 0);
    const totalCount = records.reduce((sum, r) => sum + r.count, 0);

    // Group by message type
    const byType: Record<string, { count: number; cost: number }> = {};
    for (const r of records) {
      if (!byType[r.messageType]) {
        byType[r.messageType] = { count: 0, cost: 0 };
      }
      byType[r.messageType].count += r.count;
      byType[r.messageType].cost += Number(r.cost);
    }

    return {
      month,
      year,
      totalCost,
      totalCount,
      byType,
    };
  });

  // Get usage history
  app.get('/api/billing/history', { preHandler: [app.authenticate] }, async (request: any) => {
    const { organizationId } = request.user;
    const query = request.query as { months?: string };
    const monthsBack = parseInt(query.months || '6', 10);

    const since = new Date();
    since.setMonth(since.getMonth() - monthsBack);

    const records = await prisma.usageRecord.findMany({
      where: {
        organizationId,
        createdAt: { gte: since },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Group by month
    const history: Record<string, { count: number; cost: number; byType: Record<string, number> }> = {};
    for (const r of records) {
      const key = `${r.year}-${String(r.month).padStart(2, '0')}`;
      if (!history[key]) {
        history[key] = { count: 0, cost: 0, byType: {} };
      }
      history[key].count += r.count;
      history[key].cost += Number(r.cost);
      history[key].byType[r.messageType] = (history[key].byType[r.messageType] || 0) + r.count;
    }

    return { history };
  });

  // Get per-account breakdown
  app.get('/api/billing/by-account', { preHandler: [app.authenticate] }, async (request: any) => {
    const { organizationId } = request.user;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const wabas = await prisma.whatsAppBusinessAccount.findMany({
      where: { organizationId },
      include: {
        messages: {
          where: {
            direction: 'OUTBOUND',
            billingCategory: { not: null },
            timestamp: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        },
      },
    });

    const breakdown = wabas.map(w => ({
      wabaId: w.wabaId,
      messageCount: w.messages.length,
      cost: w.messages.reduce((sum, m) => sum + Number(m.cost || 0), 0),
    }));

    return { month, year, breakdown };
  });
}

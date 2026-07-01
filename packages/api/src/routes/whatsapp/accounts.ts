import { FastifyInstance } from 'fastify';
import prisma from '../../../../database/src/client';

export async function accountsRoutes(app: FastifyInstance) {
  // List all WABAs for the organization (with phone numbers)
  app.get('/api/whatsapp/accounts', { preHandler: [app.authenticate] }, async (request: any) => {
    const { organizationId } = request.user;

    const wabas = await prisma.whatsAppBusinessAccount.findMany({
      where: { organizationId },
      include: {
        phoneNumbers: {
          select: {
            id: true,
            phoneNumberId: true,
            displayNumber: true,
            displayName: true,
            qualityRating: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
            templates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      accounts: wabas.map(w => ({
        id: w.id,
        wabaId: w.wabaId,
        status: w.status,
        phoneCount: w.phoneNumbers.length,
        messageCount: w._count.messages,
        templateCount: w._count.templates,
        phoneNumbers: w.phoneNumbers.map(p => ({
          id: p.id,
          phoneNumberId: p.phoneNumberId,
          displayNumber: p.displayNumber,
          displayName: p.displayName,
          qualityRating: p.qualityRating,
          status: p.status,
          connectedAt: p.createdAt,
        })),
        createdAt: w.createdAt,
      })),
    };
  });

  // Get single WABA details
  app.get('/api/whatsapp/accounts/:id', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const { organizationId } = request.user;
    const { id } = request.params as { id: string };

    const waba = await prisma.whatsAppBusinessAccount.findFirst({
      where: { id, organizationId },
      include: {
        phoneNumbers: true,
        _count: { select: { messages: true, templates: true } },
      },
    });

    if (!waba) {
      return reply.status(404).send({ error: 'Account not found' });
    }

    return {
      account: {
        id: waba.id,
        wabaId: waba.wabaId,
        status: waba.status,
        phoneNumbers: waba.phoneNumbers,
        messageCount: waba._count.messages,
        templateCount: waba._count.templates,
        createdAt: waba.createdAt,
      },
    };
  });

  // Disconnect (delete) a WABA
  app.delete('/api/whatsapp/accounts/:id', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const { organizationId } = request.user;
    const { id } = request.params as { id: string };

    const waba = await prisma.whatsAppBusinessAccount.findFirst({
      where: { id, organizationId },
    });

    if (!waba) {
      return reply.status(404).send({ error: 'Account not found' });
    }

    // Delete phone numbers first (cascade), then the WABA
    await prisma.phoneNumber.deleteMany({ where: { wabaId: id } });
    await prisma.whatsAppBusinessAccount.delete({ where: { id } });

    return { success: true, message: 'Account disconnected' };
  });

  // Refresh phone numbers for a WABA
  app.post('/api/whatsapp/accounts/:id/refresh', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const { organizationId } = request.user;
    const { id } = request.params as { id: string };

    const waba = await prisma.whatsAppBusinessAccount.findFirst({
      where: { id, organizationId },
    });

    if (!waba) {
      return reply.status(404).send({ error: 'Account not found' });
    }

    try {
      const { getWabaPhoneNumbers, getPhoneNumberDetails } = await import('../../services/meta-api');
      const phoneData = await getWabaPhoneNumbers(waba.wabaId, waba.businessToken);

      const phoneNumbers = phoneData.data || [];
      for (const phone of phoneNumbers) {
        const details = await getPhoneNumberDetails(phone.id, waba.businessToken).catch(() => null);

        await prisma.phoneNumber.upsert({
          where: { phoneNumberId: phone.id },
          create: {
            phoneNumberId: phone.id,
            wabaId: waba.id,
            displayNumber: details?.display_phone_number || phone.display_phone_number || '',
            displayName: details?.verified_name || phone.verified_name || '',
            qualityRating: details?.quality_rating || 'Unknown',
            status: details?.status || 'CONNECTED',
          },
          update: {
            displayNumber: details?.display_phone_number || phone.display_phone_number || '',
            displayName: details?.verified_name || phone.verified_name || '',
            qualityRating: details?.quality_rating || 'Unknown',
            status: details?.status || 'CONNECTED',
          },
        });
      }

      return { success: true, phoneCount: phoneNumbers.length };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
}

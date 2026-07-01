import { FastifyInstance } from 'fastify';
import prisma from '../../../../database/src/client';
import { z } from 'zod';
import { sendTextMessage, sendTemplateMessage } from '../../services/meta-api';

const sendMessageSchema = z.object({
  phoneNumberId: z.string().min(1),
  to: z.string().min(1),
  type: z.enum(['text', 'template']),
  text: z.string().optional(),
  templateName: z.string().optional(),
  templateLanguage: z.string().optional(),
  templateComponents: z.array(z.any()).optional(),
});

export async function messagesRoutes(app: FastifyInstance) {
  // List messages (with filters)
  app.get('/api/whatsapp/messages', { preHandler: [app.authenticate] }, async (request: any) => {
    const { organizationId } = request.user;
    const query = request.query as {
      wabaId?: string;
      phoneNumberId?: string;
      direction?: string;
      type?: string;
      limit?: string;
      offset?: string;
    };

    const where: any = {
      waba: { organizationId },
    };

    if (query.wabaId) where.wabaId = query.wabaId;
    if (query.phoneNumberId) where.phoneNumberId = query.phoneNumberId;
    if (query.direction) where.direction = query.direction;
    if (query.messageType) where.messageType = query.messageType;

    const limit = Math.min(parseInt(query.limit || '50', 10), 100);
    const offset = parseInt(query.offset || '0', 10);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          phoneNumber: { select: { displayNumber: true, displayName: true } },
          waba: { select: { wabaId: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.message.count({ where }),
    ]);

    return {
      messages: messages.map(m => ({
        id: m.id,
        direction: m.direction,
        messageType: m.messageType,
        from: m.from,
        to: m.to,
        content: m.content,
        status: m.status,
        timestamp: m.timestamp,
        billingCategory: m.billingCategory,
        cost: m.cost,
        phoneNumber: m.phoneNumber,
        wabaId: m.waba.wabaId,
      })),
      total,
      limit,
      offset,
    };
  });

  // Send a message
  app.post('/api/whatsapp/send', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    try {
      const body = sendMessageSchema.parse(request.body);
      const { organizationId } = request.user;

      // Find the phone number and its WABA
      const phoneNumber = await prisma.phoneNumber.findUnique({
        where: { phoneNumberId: body.phoneNumberId },
        include: { waba: true },
      });

      if (!phoneNumber || phoneNumber.waba.organizationId !== organizationId) {
        return reply.status(404).send({ error: 'Phone number not found' });
      }

      if (phoneNumber.waba.status !== 'active') {
        return reply.status(400).send({ error: 'WABA account is not active' });
      }

      let result;
      if (body.type === 'text') {
        if (!body.text) return reply.status(400).send({ error: 'Text is required' });
        result = await sendTextMessage(
          body.phoneNumberId,
          body.to,
          body.text,
          phoneNumber.waba.businessToken,
        );
      } else if (body.type === 'template') {
        if (!body.templateName) return reply.status(400).send({ error: 'Template name is required' });
        result = await sendTemplateMessage(
          body.phoneNumberId,
          body.to,
          body.templateName,
          body.templateLanguage || 'es',
          body.templateComponents || [],
          phoneNumber.waba.businessToken,
        );
      }

      // Store outbound message
      const metaMessageId = result?.messages?.[0]?.id;
      await prisma.message.create({
        data: {
          wabaId: phoneNumber.wabaId,
          phoneNumberId: phoneNumber.id,
          direction: 'OUTBOUND',
          messageType: body.type,
          from: phoneNumber.displayNumber,
          to: body.to,
          content: body.type === 'text' ? { body: body.text } : { template: body.templateName },
          status: 'sent',
          metaMessageId,
          timestamp: new Date(),
        },
      });

      return {
        success: true,
        messageId: metaMessageId,
        to: body.to,
        type: body.type,
      };
    } catch (err: any) {
      console.error('Send message error:', err);
      return reply.status(500).send({ error: err.message });
    }
  });
}

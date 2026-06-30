import { FastifyInstance } from 'fastify';
import prisma from '../../../database/src/client';
import { config } from '../../config';

export async function webhookRoutes(app: FastifyInstance) {
  // Webhook verification (GET) and event handling (POST)
  app.all('/webhook/whatsapp', async (request, reply) => {
    // ─── GET: Verification handshake ──────────────────────
    if (request.method === 'GET') {
      const query = request.query as Record<string, string>;
      const mode = query['hub.mode'];
      const token = query['hub.verify_token'];
      const challenge = query['hub.challenge'];

      if (mode === 'subscribe' && token === config.meta.verifyToken && challenge) {
        console.log('Webhook verified successfully');
        return reply.code(200).send(challenge);
      }

      console.error('Webhook verification failed:', { mode, token });
      return reply.code(403).send('Forbidden');
    }

    // ─── POST: Event handling ─────────────────────────────
    const body = request.body as any;

    // Acknowledge immediately
    reply.code(200).send('EVENT_RECEIVED');

    // Process asynchronously
    try {
      const entry = body.entry?.[0];
      if (!entry) return;

      for (const change of entry.changes || []) {
        const field = change.field;
        const value = change.value;

        // Log webhook event
        await prisma.webhookEvent.create({
          data: {
            wabaId: entry.id || null,
            eventField: field,
            payload: body,
            status: 'received',
          },
        });

        // Process messages
        if (field === 'messages' && value.messages) {
          for (const msg of value.messages) {
            const phoneNumberId = value.metadata?.phone_number_id;
            const from = msg.from;
            const msgType = msg.type;

            // Find the WABA and phone number
            const phoneNumber = phoneNumberId
              ? await prisma.phoneNumber.findUnique({
                  where: { phoneNumberId },
                  include: { waba: true },
                })
              : null;

            if (phoneNumber) {
              await prisma.message.create({
                data: {
                  wabaId: phoneNumber.wabaId,
                  phoneNumberId: phoneNumber.id,
                  direction: 'INBOUND',
                  messageType: msgType,
                  from,
                  to: phoneNumber.displayNumber,
                  content: msg,
                  status: 'received',
                  metaMessageId: msg.id,
                  timestamp: new Date(parseInt(msg.timestamp) * 1000),
                },
              });
            }
          }
        }

        // Process statuses (delivery/read receipts)
        if (field === 'messages' && value.statuses) {
          for (const status of value.statuses) {
            await prisma.message.updateMany({
              where: { metaMessageId: status.id },
              data: { status: status.status },
            });
          }
        }
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  });
}

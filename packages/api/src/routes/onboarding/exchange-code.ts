import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { handleEmbeddedSignup } from '../../services/token-exchange';

const exchangeSchema = z.object({
  code: z.string().min(1),
});

export async function onboardingRoutes(app: FastifyInstance) {
  app.post('/api/onboarding/exchange', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    try {
      const body = exchangeSchema.parse(request.body);
      const { organizationId } = request.user;

      const result = await handleEmbeddedSignup(body.code, organizationId);

      return reply.send({
        success: true,
        wabaId: result.wabaId,
        phoneCount: result.phoneCount,
      });
    } catch (err: any) {
      console.error('Onboarding exchange error:', err);
      return reply.status(500).send({
        success: false,
        error: err.message || 'Failed to complete onboarding',
      });
    }
  });
}

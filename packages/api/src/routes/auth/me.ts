import { FastifyInstance } from 'fastify';
import prisma from '@agilmsg/database';

export async function meRoutes(app: FastifyInstance) {
  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (request: any) => {
    const { userId } = request.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      organization: { id: user.organizationId, name: user.organization.name },
    };
  });
}

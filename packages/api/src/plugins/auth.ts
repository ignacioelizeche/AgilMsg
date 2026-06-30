import { FastifyInstance } from 'fastify';
import fjwt from '@fastify/jwt';

export async function authPlugin(app: FastifyInstance) {
  await app.register(fjwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    sign: { expiresIn: '7d' },
  });

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
}

// Module augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

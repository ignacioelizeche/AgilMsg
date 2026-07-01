import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fjwt from '@fastify/jwt';

export async function authPlugin(app: FastifyInstance) {
  await app.register(fjwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    sign: { expiresIn: '7d' },
  });

  app.decorate('authenticate', authenticate);
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}

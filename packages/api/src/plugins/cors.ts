import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

export async function corsPlugin(app: FastifyInstance) {
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
}

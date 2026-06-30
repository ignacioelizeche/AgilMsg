import { FastifyInstance } from 'fastify';
import prisma from '@agilmsg/database';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function loginRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { organization: true },
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = app.jwt.sign({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      organization: { id: user.organizationId, name: user.organization.name },
    };
  });
}

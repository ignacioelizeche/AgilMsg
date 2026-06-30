import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { authPlugin } from './plugins/auth';
import { corsPlugin } from './plugins/cors';
import { registerRoutes } from './routes/auth/register';
import { loginRoutes } from './routes/auth/login';
import { meRoutes } from './routes/auth/me';
import { onboardingRoutes } from './routes/onboarding/exchange-code';
import { accountsRoutes } from './routes/whatsapp/accounts';
import { messagesRoutes } from './routes/whatsapp/messages';
import { templatesRoutes } from './routes/whatsapp/templates';
import { webhookRoutes } from './routes/webhooks/whatsapp-callback';
import { billingRoutes } from './routes/billing/usage';

async function main() {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  // Plugins
  await app.register(corsPlugin);
  await app.register(authPlugin);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // API Routes
  await app.register(registerRoutes);
  await app.register(loginRoutes);
  await app.register(meRoutes);
  await app.register(onboardingRoutes);
  await app.register(accountsRoutes);
  await app.register(messagesRoutes);
  await app.register(templatesRoutes);
  await app.register(webhookRoutes);
  await app.register(billingRoutes);

  // Health check
  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    return reply.code(404).send({ error: 'Not found' });
  });

  // Start server
  await app.listen({ port: config.port, host: config.host });
  console.log(`🚀 AgilMsg API running on http://${config.host}:${config.port}`);
  console.log(`   Base path: ${config.basePath}`);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

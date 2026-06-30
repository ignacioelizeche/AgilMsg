import { FastifyInstance } from 'fastify';
import prisma from '../../../database/src/client';
import { z } from 'zod';
import { getTemplates, createTemplate } from '../../services/meta-api';

const createTemplateSchema = z.object({
  wabaId: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['marketing', 'utility', 'authentication']),
  language: z.string().default('es'),
  components: z.array(z.any()).optional(),
});

export async function templatesRoutes(app: FastifyInstance) {
  // List templates for a WABA (local DB + optional sync from Meta)
  app.get('/api/whatsapp/templates', { preHandler: [app.authenticate] }, async (request: any) => {
    const { organizationId } = request.user;
    const query = request.query as { wabaId?: string };

    const where: any = {
      waba: { organizationId },
    };

    if (query.wabaId) where.wabaId = query.wabaId;

    const templates = await prisma.template.findMany({
      where,
      include: { waba: { select: { wabaId: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      templates: templates.map(t => ({
        id: t.id,
        templateId: t.templateId,
        name: t.name,
        language: t.language,
        category: t.category,
        status: t.status,
        components: t.components,
        wabaId: t.waba.wabaId,
        createdAt: t.createdAt,
      })),
    };
  });

  // Create a template (save locally + submit to Meta)
  app.post('/api/whatsapp/templates', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    try {
      const body = createTemplateSchema.parse(request.body);
      const { organizationId } = request.user;

      // Verify WABA belongs to organization
      const waba = await prisma.whatsAppBusinessAccount.findFirst({
        where: { id: body.wabaId, organizationId },
      });

      if (!waba) {
        return reply.status(404).send({ error: 'WABA not found' });
      }

      // Save to local DB
      const template = await prisma.template.create({
        data: {
          wabaId: body.wabaId,
          name: body.name,
          category: body.category,
          language: body.language,
          components: body.components || [],
          status: 'PENDING',
        },
      });

      // Submit to Meta
      try {
        const metaResult = await createTemplate(
          waba.wabaId,
          {
            name: body.name,
            category: body.category,
            language: body.language,
            components: body.components || [],
          },
          waba.businessToken,
        );

        await prisma.template.update({
          where: { id: template.id },
          data: {
            templateId: metaResult.id,
            status: 'PENDING',
          },
        });
      } catch (metaErr: any) {
        console.log('Meta template submit failed (saved locally):', metaErr.message);
      }

      return reply.status(201).send({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          category: template.category,
          status: template.status,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // Sync templates from Meta
  app.post('/api/whatsapp/templates/sync', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    try {
      const { organizationId } = request.user;
      const body = request.body as { wabaId: string };

      const waba = await prisma.whatsAppBusinessAccount.findFirst({
        where: { id: body.wabaId, organizationId },
      });

      if (!waba) {
        return reply.status(404).send({ error: 'WABA not found' });
      }

      const metaTemplates = await getTemplates(waba.wabaId, waba.businessToken);
      const templates = metaTemplates.data || [];

      let synced = 0;
      for (const t of templates) {
        await prisma.template.upsert({
          where: { templateId: t.id },
          create: {
            templateId: t.id,
            wabaId: waba.id,
            name: t.name,
            category: t.category,
            language: t.language,
            status: t.status || 'UNKNOWN',
            components: t.components || [],
          },
          update: {
            name: t.name,
            status: t.status || 'UNKNOWN',
            components: t.components || [],
          },
        });
        synced++;
      }

      return { success: true, synced };
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
}

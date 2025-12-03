import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function crmRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt);

  // 1. Listar Leads (Agrupados no Front)
  app.withTypeProvider<ZodTypeProvider>().get('/leads', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    const leads = await prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return leads;
  });

  // 2. Criar Lead
  app.withTypeProvider<ZodTypeProvider>().post('/leads', {
    schema: {
      body: z.object({
        title: z.string(),
        contactName: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        value: z.number().optional(),
      })
    }
  }, async (request, reply) => {
    const data = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    await prisma.lead.create({
      data: {
        ...data,
        status: 'NEW', // Sempre nasce na primeira coluna
        organizationId
      }
    });

    return reply.status(201).send();
  });

  // 3. Mover Lead (Atualizar Status)
  app.withTypeProvider<ZodTypeProvider>().patch('/leads/:id/status', {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      body: z.object({
        status: z.enum(['NEW', 'CONTACT', 'PROPOSAL', 'WON', 'LOST'])
      })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    await prisma.lead.updateMany({
      where: { id, organizationId }, // updateMany por segurança (garante orgId)
      data: { status }
    });

    return reply.status(204).send();
  });

  // 4. Deletar Lead
  app.withTypeProvider<ZodTypeProvider>().delete('/leads/:id', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;
    const { id } = request.params as { id: string };

    await prisma.lead.deleteMany({
      where: { id, organizationId }
    });

    return reply.status(204).send();
  });
}
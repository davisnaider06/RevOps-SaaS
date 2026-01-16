import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function crmRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt);

  // 1. Listar Leads
  app.withTypeProvider<ZodTypeProvider>().get('/leads', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    const leads = await prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return leads;
  });

  // 2. Criar Lead + Notificação de Criação
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
    // Pegamos o 'sub' (ID do usuário) para vincular a notificação a ele
    const { organizationId, sub } = request.user; 

    const lead = await prisma.lead.create({
      data: {
        ...data,
        status: 'NEW', 
        organizationId
      }
    });

    // --- NOVO: Cria a Notificação ---
    await prisma.notification.create({
        data: {
            title: "Novo Lead Cadastrado 🚀",
            message: `Oportunidade: ${data.title} (${data.contactName})`,
            userId: sub // Envia para o usuário que criou
        }
    })
    // --------------------------------

    return reply.status(201).send();
  });

  // 3. Mover Lead + Notificação de Venda
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
    const { organizationId, sub } = request.user;

    // Atualiza o status
    await prisma.lead.updateMany({
      where: { id, organizationId },
      data: { status }
    });

    if (status === 'WON') {
        // Buscamos o lead para pegar o nome e deixar a mensagem bonita
        const lead = await prisma.lead.findUnique({ where: { id } })
        
        if (lead) {
            await prisma.notification.create({
                data: {
                    title: "Venda Realizada! 💰",
                    message: `Parabéns! Você fechou o negócio "${lead.title}".`,
                    userId: sub
                }
            })
        }
    }
    // ----------------------------------------------------

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
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function clientsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt);

  // 1. Criar Cliente
  app.withTypeProvider<ZodTypeProvider>().post('/clients', {
    schema: {
      body: z.object({
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    }
  }, async (request, reply) => {
    const { name, email, phone } = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        organizationId
      }
    });

    return reply.status(201).send({ clientId: client.id, message: 'Client created!' });
  });

  // 2. Listar Clientes (Para o Dropdown)
  app.withTypeProvider<ZodTypeProvider>().get('/clients', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    const clients = await prisma.client.findMany({
      where: { organizationId },
      select: { id: true, name: true } // Só precisamos do ID e Nome
    });

    return clients;
  });
}
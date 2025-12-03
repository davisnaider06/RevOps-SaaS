import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function clientsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt);

  app.withTypeProvider<ZodTypeProvider>().post('/clients', {
    schema: {
      body: z.object({
        name: z.string(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
      })
    }
  }, async (request, reply) => {
    const { name, email, phone } = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    if (email && email.trim() !== '') {
      const emailExists = await prisma.client.findFirst({
        where: { 
          email, 
          organizationId 
        }
      });

      if (emailExists) {
        return reply.status(409).send({ message: 'Já existe um cliente com este e-mail.' });
      }
    }

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

  app.withTypeProvider<ZodTypeProvider>().get('/clients', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    const clients = await prisma.client.findMany({
      where: { organizationId },
      select: { 
        id: true, 
        name: true,
        email: true, 
        phone: true, 
        _count: {   
            select: { projects: true }
        }
      },
      orderBy: { name: 'asc' } 
    });

    return clients;
  });

app.withTypeProvider<ZodTypeProvider>().put('/clients/:id', {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      body: z.object({
        name: z.string(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
      })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { name, email, phone } = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    const client = await prisma.client.findFirst({
      where: { id, organizationId }
    });

    if (!client) return reply.status(404).send({ message: 'Cliente não encontrado.' });

    if (email && email.trim() !== '') {
      const emailExists = await prisma.client.findFirst({
        where: { 
          email, 
          organizationId,
          NOT: { id } // Ignora o próprio cliente que ta editando
        }
      });

      if (emailExists) {
        return reply.status(409).send({ message: 'Este e-mail já pertence a outro cliente.' });
      }
    }
    await prisma.client.update({
      where: { id },
      data: { name, email, phone }
    });

    return reply.status(204).send();
  });

  app.withTypeProvider<ZodTypeProvider>().delete('/clients/:id', {
    schema: {
      params: z.object({ id: z.string().uuid() })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    // @ts-ignore
    const { organizationId } = request.user;

    const client = await prisma.client.findFirst({ where: { id, organizationId } });
    if (!client) return reply.status(404).send({ message: 'Cliente não encontrado.' });

    try {
      await prisma.client.delete({ where: { id } });
      return reply.status(204).send();
    } catch (error) {
      return reply.status(400).send({ message: 'Não é possível apagar cliente com projetos vinculados.' });
    }
  });

}
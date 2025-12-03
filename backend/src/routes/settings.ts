import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function settingsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt);

  app.withTypeProvider<ZodTypeProvider>().get('/settings', async (request, reply) => {
    // @ts-ignore
    const { sub: userId } = request.user; 

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true 
      }
    });

    if (!user) return reply.status(404).send({ message: 'Usuário não encontrado' });

    return {
      name: user.name,
      email: user.email,
      companyName: user.organization.name,
      document: user.organization.document,
    };
  });


  app.withTypeProvider<ZodTypeProvider>().put('/settings', {
    schema: {
      body: z.object({
        name: z.string(),
        companyName: z.string(),
        document: z.string().optional(),
      })
    }
  }, async (request, reply) => {
    // @ts-ignore
    const { sub: userId, organizationId } = request.user;
    const { name, companyName, document } = request.body;

    // Atualiza o Usuário
    await prisma.user.update({
      where: { id: userId },
      data: { name }
    });

    // Atualiza a Empresa
    await prisma.organization.update({
      where: { id: organizationId },
      data: { 
        name: companyName,
        document: document || null 
      }
    });

    return reply.status(200).send({ message: 'Dados atualizados!' });
  });
}
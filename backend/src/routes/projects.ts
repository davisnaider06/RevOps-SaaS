import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function projectsRoutes(app: FastifyInstance) {
  
  // 1. Criar Projeto
  app.withTypeProvider<ZodTypeProvider>().post('/projects', {
    onRequest: [verifyJwt], 
    schema: {
      body: z.object({
        name: z.string(),
        description: z.string().optional(),
        totalBudget: z.number(),
        clientId: z.string().uuid(),
      })
    }
  }, async (request, reply) => {
    const { name, description, totalBudget, clientId } = request.body;
    // @ts-ignore
    const { organizationId, sub: userId } = request.user;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        totalBudget,
        clientId,
        organizationId,
        managerId: userId,
        status: 'ACTIVE'
      }
    });

    return reply.status(201).send({ projectId: project.id, message: 'Project created!' });
  });

  // 2. Listar Projetos (ESSA É A ROTA QUE ESTAVA FALTANDO OU COM ERRO)
  app.withTypeProvider<ZodTypeProvider>().get('/projects', {
    onRequest: [verifyJwt], // Garante proteção
  }, async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    const projects = await prisma.project.findMany({
      where: { organizationId },
      select: { 
        id: true, 
        name: true 
      }
    });

    return projects; // Retorna o Array []
  });
}
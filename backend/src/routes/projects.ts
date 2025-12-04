import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function projectsRoutes(app: FastifyInstance) {
  
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

  app.withTypeProvider<ZodTypeProvider>().get('/projects', {
    onRequest: [verifyJwt], // Garante proteção
  }, async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    const projects = await prisma.project.findMany({
      where: { organizationId },
      select: { 
        id: true, 
        name: true, 
        status: true,
        totalBudget: true,
        client: {          
            select: { name: true }
        }
      },
    });

    return projects; // Retorna o Array []
  });
 // 3. Detalhes do Projeto (CORRIGIDO E SEGURO)
  app.withTypeProvider<ZodTypeProvider>().get('/projects/:id', {
    onRequest: [verifyJwt], // <--- O PORTEIRO VOLTOU! (Isso resolve o erro undefined)
    schema: {
      params: z.object({ id: z.string().uuid() }),
    }
  }, async (request, reply) => {
    const { id } = request.params;
    // @ts-ignore
    const { organizationId } = request.user; // Agora isso vai funcionar!

    // 1. Busca dados do projeto
    const project = await prisma.project.findFirst({
      where: { id, organizationId },
      include: {
        client: { select: { name: true, email: true, phone: true } }
      }
    });

    if (!project) return reply.status(404).send({ message: 'Projeto não encontrado.' });

    // 2. Calcula Receitas
    const incomeAgg = await prisma.financialRecord.aggregate({
      where: { projectId: id, type: 'INCOME', organizationId },
      _sum: { amount: true }
    });

    // 3. Calcula Despesas
    const expenseAgg = await prisma.financialRecord.aggregate({
      where: { projectId: id, type: 'EXPENSE', organizationId },
      _sum: { amount: true }
    });

    // 4. Busca Transações
    const transactions = await prisma.financialRecord.findMany({
      where: { projectId: id, organizationId },
      orderBy: { date: 'desc' }
    });

    // Cálculos seguros (evita erro se for null)
    const totalIncome = Number(incomeAgg._sum?.amount || 0);
    const totalExpense = Number(expenseAgg._sum?.amount || 0);
    const balance = totalIncome - totalExpense;
    
    // Cálculo do Burn Rate (Custo / Orçamento)
    const budgetNum = Number(project.totalBudget);
    const burnRate = budgetNum > 0 ? (totalExpense / budgetNum) * 100 : 0;

    return {
      ...project,
      stats: {
        totalIncome,
        totalExpense,
        balance,
        burnRate
      },
      transactions
    };
  });
}
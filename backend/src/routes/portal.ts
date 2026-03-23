import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function portalRoutes(app: FastifyInstance) {
  // ATENÇÃO: NÃO TEM 'verifyJwt' AQUI. É PÚBLICO.

  // 1. Dados do Portal do Cliente
  app.withTypeProvider<ZodTypeProvider>().get('/portal/:token', {
    schema: {
      params: z.object({ token: z.string() }),
    }
  }, async (request, reply) => {
    const { token } = request.params;

    // Busca projeto pelo token de compartilhamento
    const project = await prisma.project.findUnique({
      where: { shareToken: token },
      include: {
        client: { select: { name: true } }
      }
    });

    if (!project) return reply.status(404).send({ message: 'Portal não encontrado ou link inválido.' });

    // Calcula os totais (igual fizemos na rota privada)
    const expenseAgg = await prisma.financialRecord.aggregate({
      where: { projectId: project.id, type: 'EXPENSE' }, // Não filtra por org aqui, confia no token
      _sum: { amount: true }
    });

    const totalExpense = Number(expenseAgg._sum?.amount || 0);
    const budgetNum = Number(project.totalBudget);
    
    // O que o cliente vê:
    return {
      name: project.name,
      clientName: project.client.name,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      financials: {
        totalBudget: budgetNum,
        totalUsed: totalExpense,
        burnRate: budgetNum > 0 ? (totalExpense / budgetNum) * 100 : 0
      }
    };
  });
}
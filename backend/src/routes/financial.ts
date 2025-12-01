import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function financialRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt); //Protege as rotas desse arquivo

  // Lançar Receita ou Despesa
  app.withTypeProvider<ZodTypeProvider>().post('/financial-records', {
    schema: {
      body: z.object({
        type: z.enum(['INCOME', 'EXPENSE']),
        amount: z.number(),
        description: z.string(),
        date: z.string(), // front manda data como string ISO (2025-12-01)
        projectId: z.string().uuid().optional(),
        clientId: z.string().uuid().optional(),
      })
    }
  }, async (request, reply) => {
    const { type, amount, description, date, projectId, clientId } = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    await prisma.financialRecord.create({
      data: {
        type,
        amount,
        description,
        date: new Date(date),
        projectId,
        clientId,
        organizationId,
        status: 'PAID' // Simplificação para o MVP: tudo nasce pago
      }
    });

    return reply.status(201).send({ message: 'Record created!' });
  });

  // O Dashboard (Resumo Financeiro)
  app.withTypeProvider<ZodTypeProvider>().get('/financial-records/dashboard', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    // Soma todas as Receitas
    const totalIncome = await prisma.financialRecord.aggregate({
      where: { organizationId, type: 'INCOME' },
      _sum: { amount: true }
    });

    // Soma todas as Despesas
    const totalExpense = await prisma.financialRecord.aggregate({
      where: { organizationId, type: 'EXPENSE' },
      _sum: { amount: true }
    });

    const income = Number(totalIncome._sum.amount) || 0;
    const expense = Number(totalExpense._sum.amount) || 0;

    return {
      income,
      expense,
      balance: income - expense //Lucro
    };
  });
  app.withTypeProvider<ZodTypeProvider>().get('/financial-records', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    const records = await prisma.financialRecord.findMany({
      where: { organizationId },
      orderBy: { date: 'desc' }, // Mais recentes primeiro
      take: 10, // Pega só as 10 últimas
      include: {
        project: { select: { name: true } }, // Traz o nome do projeto
        client: { select: { name: true } }   // Traz o nome do cliente
      }
    });

    return records;
  });
}

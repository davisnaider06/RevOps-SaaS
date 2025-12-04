import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { verifyJwt } from "../middlewares/verify-jwt";

export async function productsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt);

  app.withTypeProvider<ZodTypeProvider>().get('/products', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    const products = await prisma.product.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' }
    });

    return products;
  });

  app.withTypeProvider<ZodTypeProvider>().post('/products', {
    schema: {
      body: z.object({
        name: z.string(),
        price: z.number(),
        costPrice: z.number().optional(),
        type: z.enum(['GOOD', 'SERVICE']),
        stockQuantity: z.number().optional(), // Só se for GOOD
      })
    }
  }, async (request, reply) => {
    const { name, price, costPrice, type, stockQuantity } = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    await prisma.product.create({
      data: {
        name,
        price,
        costPrice,
        type,
        // Se for serviço, estoque é sempre 0. Se for produto, usa o valor ou 0.
        stockQuantity: type === 'SERVICE' ? 0 : (stockQuantity || 0),
        organizationId
      }
    });

    return reply.status(201).send({ message: 'Produto cadastrado!' });
  });

  app.withTypeProvider<ZodTypeProvider>().patch('/products/:id/stock', {
    schema: {
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ quantity: z.number() }) // Nova quantidade
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { quantity } = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    await prisma.product.updateMany({
      where: { id, organizationId },
      data: { stockQuantity: quantity }
    });

    return reply.status(204).send();
  });
  

  app.withTypeProvider<ZodTypeProvider>().delete('/products/:id', {
      schema: { params: z.object({ id: z.string().uuid() }) }
  }, async (request, reply) => {
      const { id } = request.params;
      // @ts-ignore
      const { organizationId } = request.user;

      await prisma.product.deleteMany({
          where: { id, organizationId }
      });
      
      return reply.status(204).send();
  });
}
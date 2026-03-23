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

  app.withTypeProvider<ZodTypeProvider>().post('/products/checkout', {
    schema: {
      body: z.object({
        items: z.array(z.object({
          productId: z.string().uuid(),
          quantity: z.number().min(1)
        })),
        clientId: z.string().uuid().optional(), // Cliente é opcional no balcão
        paymentMethod: z.string().default("Dinheiro") // Ex: Pix, Cartão
      })
    }
  }, async (request, reply) => {
    const { items, clientId, paymentMethod } = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    // 1. Calcular o total e validar estoque
    let totalAmount = 0;
    const descriptionParts: string[] =[];

    // Vamos iterar sobre os itens para preparar a venda
    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId }
        });

        if (!product) continue;

        // Verifica estoque se for produto físico
        if (product.type === 'GOOD') {
            if (product.stockQuantity < item.quantity) {
                return reply.status(400).send({ 
                    message: `Estoque insuficiente para ${product.name}. Restam ${product.stockQuantity}.` 
                });
            }
        }

        totalAmount += Number(product.price) * item.quantity;
        descriptionParts.push(`${item.quantity}x ${product.name}`);
    }

    // 2. Transação Atômica (Tudo ou nada)
    await prisma.$transaction(async (tx) => {
        // A. Baixar Estoque
        for (const item of items) {
            const product = await tx.product.findUnique({ where: { id: item.productId }});
            if (product?.type === 'GOOD') {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stockQuantity: { decrement: item.quantity } }
                });
            }
        }

        // B. Criar o registro financeiro (Receita)
        await tx.financialRecord.create({
            data: {
                type: 'INCOME',
                amount: totalAmount,
                description: `Venda PDV [${paymentMethod}]: ${descriptionParts.join(', ')}`,
                date: new Date(),
                category: 'Vendas',
                status: 'PAID', // Venda de balcão já está paga
                clientId: clientId || null,
                organizationId
            }
        });
    });

    return reply.status(201).send({ message: 'Venda realizada!' });
  });

  app.withTypeProvider<ZodTypeProvider>().post('/products/batch', {
    schema: {
      body: z.array(z.object({
        name: z.string(),
        price: z.number(),
        stockQuantity: z.number().default(0),
        type: z.enum(['GOOD', 'SERVICE']).default('GOOD')
      }))
    }
  }, async (request, reply) => {
    const products = request.body;
    // @ts-ignore
    const { organizationId } = request.user;

    await prisma.product.createMany({
      data: products.map(p => ({
        ...p,
        organizationId
      }))
    });

    return reply.status(201).send({ message: `${products.length} itens importados!` });
  });

  // Resumo de Vendas do Dia (Para Sincronização)
  app.withTypeProvider<ZodTypeProvider>().get('/sales/summary', async (request, reply) => {
    // @ts-ignore
    const { organizationId } = request.user;

    // Define o intervalo de tempo
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    //  Busca todas as receitas de Venda PDV de hoje
    const sales = await prisma.financialRecord.findMany({
      where: {
        organizationId,
        date: { gte: startOfDay, lte: endOfDay },
        description: { contains: 'Venda PDV' } // Filtra só o que veio do caixa
      }
    });

    // Processa o texto para somar os itens
    const summary: Record<string, number> = {};

    sales.forEach(sale => {
      // Remove o prefixo "Venda PDV [Metodo]: " para sobrar só os itens
      const itemsPart = sale.description.split(': ')[1]; 
      if (!itemsPart) return;

      const items = itemsPart.split(', ');

      items.forEach(itemStr => {
        // Regex para separar "2" de "Shampoo"
        const match = itemStr.match(/^(\d+)x\s(.+)$/);
        if (match) {
          const qtd = parseInt(match[1]);
          const name = match[2];

          if (!summary[name]) summary[name] = 0;
          summary[name] += qtd;
        }
      });
    });

    //Formata para devolver uma lista bonita
    const result = Object.entries(summary).map(([product, quantity]) => ({
      product,
      quantity
    })).sort((a, b) => b.quantity - a.quantity); // Mais vendidos primeiro

    return result;
  });
}
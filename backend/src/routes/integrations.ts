import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function integrationRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  
  app.get('/integrations', async (request) => {
    // @ts-ignore
    const { sub } = request.user
    
    return await prisma.paymentIntegration.findMany({
      where: { userId: sub }
    })
  })

  app.post('/integrations', async (request, reply) => {
    // @ts-ignore
    const { sub } = request.user

    const bodySchema = z.object({
      provider: z.enum(['MERCADO_PAGO', 'KIWIFY', 'CAKTO', 'INTER', 'UTMIFY']),
      name: z.string(),
      credentials: z.any()
    })

    const { provider, name, credentials } = bodySchema.parse(request.body)

    const existing = await prisma.paymentIntegration.findFirst({
        where: { userId: sub, provider }
    })

    if (existing) {
        const updated = await prisma.paymentIntegration.update({
            where: { id: existing.id },
            data: { 
                credentials: credentials as any,
                isActive: true, 
                name 
            }
        })
        return reply.send(updated)
    }

    const integration = await prisma.paymentIntegration.create({
      data: {
        userId: sub,
        provider,
        name,
        credentials: credentials as any
      }
    })

    return reply.status(201).send(integration)
  })

  // 3. Desativar/Remover
  app.delete('/integrations/:id', async (request, reply) => {
    // @ts-ignore
    const { sub } = request.user
    const { id } = request.params as { id: string }

    await prisma.paymentIntegration.deleteMany({
        where: { id, userId: sub } // deleteMany por segurança
    })

    return reply.status(204).send()
  })
}
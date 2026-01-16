import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function notificationsRoutes(app: FastifyInstance) {
  // Todas as rotas aqui precisam de login
 app.addHook('onRequest', authenticate)

  // Listar notificações do usuário
  app.get('/notifications', async (request) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: 'desc' },
    })
    return notifications
  })

  // Marcar como lida
  app.patch('/notifications/:id/read', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(request.params)

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return reply.status(204).send()
  })

  app.patch('/notifications/read-all', async (request, reply) => {
  await prisma.notification.updateMany({
    where: { 
        userId: request.user.sub, 
        isRead: false 
    },
    data: { isRead: true }
  })

  return reply.status(204).send()
})
}
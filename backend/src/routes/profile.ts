import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function profileRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  // 1. Buscar dados do perfil (incluindo Pix)
  app.get('/profile', async (request) => {
    // @ts-ignore
    const { sub } = request.user

    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: {
        id: true,
        name: true,
        email: true,
        pixKey: true,
        pixName: true,
        pixCity: true
      }
    })

    return user
  })

  // 2. Atualizar configuração do Pix
  app.patch('/profile/pix', async (request, reply) => {
    // @ts-ignore
    const { sub } = request.user

    const bodySchema = z.object({
      pixKey: z.string().min(1, "Chave Pix é obrigatória"),
      pixName: z.string().min(1, "Nome do beneficiário é obrigatório"),
      pixCity: z.string().min(1, "Cidade é obrigatória"),
    })

    const data = bodySchema.parse(request.body)

    await prisma.user.update({
      where: { id: sub },
      data: {
        pixKey: data.pixKey,
        pixName: data.pixName.toUpperCase(), // Pix exige maiúsculas
        pixCity: data.pixCity.toUpperCase()
      }
    })

    return reply.status(204).send()
  })
}
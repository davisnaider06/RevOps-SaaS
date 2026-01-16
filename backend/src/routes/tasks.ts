import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function tasksRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  // Listar tarefas (Agenda)
  app.get('/tasks', async (request) => {
    const tasks = await prisma.task.findMany({
      where: { userId: request.user.sub },
      orderBy: { dueDate: 'asc' }, // As mais urgentes primeiro
    })
    return tasks
  })

  // Criar nova tarefa
  app.post('/tasks', async (request, reply) => {
    const bodySchema = z.object({
      title: z.string(),
      date: z.string().optional(), // Pode vir nulo
    })
    const { title, date } = bodySchema.parse(request.body)

    const task = await prisma.task.create({
      data: {
        title,
        dueDate: date ? new Date(date) : null,
        userId: request.user.sub,
      },
    })

    return reply.status(201).send(task)
  })

  // Marcar/Desmarcar como concluída
  app.patch('/tasks/:id/toggle', async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() })
    const bodySchema = z.object({ isCompleted: z.boolean() })

    const { id } = paramsSchema.parse(request.params)
    const { isCompleted } = bodySchema.parse(request.body)

    await prisma.task.update({
      where: { id },
      data: { isCompleted },
    })

    return reply.status(204).send()
  })
}
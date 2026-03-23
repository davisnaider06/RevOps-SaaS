import { FastifyRequest, FastifyReply } from 'fastify'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verifica o token no header Authorization
    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({ message: 'Token inválido ou não fornecido.' })
  }
}
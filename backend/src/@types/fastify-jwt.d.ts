import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      sub: string
      name: string
      avatarUrl?: string
    } // Aqui você define o que salvou no token
  }
}
import fastify from 'fastify'
import cors from '@fastify/cors'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { authRoutes } from './routes/auth'
import {z} from 'zod'

const app = fastify()

app.register(cors, {
  origin: '*', 
})

import { projectsRoutes } from './routes/projects'
import { financialRoutes } from './routes/financial'
import { clientsRoutes } from './routes/clients'

// zod
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(authRoutes)
app.register(projectsRoutes)
app.register(financialRoutes)
app.register(clientsRoutes)

// Health Check
app.get('/', async () => {
  return { message: 'API RevOps está rodando!' }
})

// Subir o servidor
app.listen({ port: 3333 }).then(() => {
  console.log('Servidor HTTP rodando em http://localhost:3333')
})
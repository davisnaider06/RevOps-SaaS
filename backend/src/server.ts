import fastify from 'fastify'
import cors from '@fastify/cors'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { authRoutes } from './routes/auth'
import {z} from 'zod'

const app = fastify()

app.register(cors, {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

import { projectsRoutes } from './routes/projects'
import { financialRoutes } from './routes/financial'
import { clientsRoutes } from './routes/clients'
import { passwordRoutes } from './routes/password'

// zod
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(authRoutes)
app.register(projectsRoutes)
app.register(financialRoutes)
app.register(clientsRoutes)
app.register(passwordRoutes)

// Health Check
app.get('/', async () => {
  return { message: 'API RevOps está rodando!' }
})

// Subir o servidor
app.listen({ 
  host: '0.0.0.0', 
  port: process.env.PORT ? Number(process.env.PORT) : 3333 
}).then((address) => {
  console.log(`🔥 Servidor HTTP rodando em ${address}`)
})
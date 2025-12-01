import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function authRoutes(app: FastifyInstance) {
  
  // O segredo  .withTypeProvider<ZodTypeProvider>()
  // conecta o Zod ao TypeScript do Fastify
  app.withTypeProvider<ZodTypeProvider>().post('/register', {
    schema: {
      body: z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        companyName: z.string(),
      })
    }
  }, async (request, reply) => {
    // Agora o TypeScript sabe que 'name' existe e é uma string!
    const { name, email, password, companyName } = request.body;

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return reply.status(409).send({ message: 'E-mail already exists.' });
    }

    const passwordHash = await hash(password, 6);

    let slug = companyName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) slug = `org-${Date.now()}`;

    const slugExists = await prisma.organization.findUnique({ where: { slug } })
    if (slugExists) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`
    }

    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: companyName,
          slug: slug,
        }
      });

      await tx.user.create({
        data: {
          name,
          email,
          password_hash: passwordHash,
          role: 'OWNER',
          organizationId: org.id
        }
      });
    });

    return reply.status(201).send({ message: 'Account created successfully!' });
  });

  app.withTypeProvider<ZodTypeProvider>().post('/sessions', {
    schema: {
      body: z.object({
        email: z.string().email(),
        password: z.string(),
      })
    }
  }, async (request, reply) => {
    const { email, password } = request.body;

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return reply.status(400).send({ message: 'Invalid credentials.' });
    }

    // Comparar a senha enviada com o Hash do banco
    const isPasswordValid = await compare(password, user.password_hash);

    if (!isPasswordValid) {
      return reply.status(400).send({ message: 'Invalid credentials.' });
    }

    // Gera o Token JWT
    // Precisamos importar o 'sign' do jsonwebtoken
    const token = sign(
      { 
        role: user.role, 
        organizationId: user.organizationId 
      }, 
      process.env.JWT_SECRET || 'segredo-padrao', 
      {
        subject: user.id, // O dono do token
        expiresIn: '7d',  // Dura 7 dias
      }
    );

    // Retornao token e dados básicos do usuário
    return reply.status(200).send({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  });
}
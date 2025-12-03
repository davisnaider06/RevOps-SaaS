import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { Resend } from 'resend'; // <--- Importar

export async function passwordRoutes(app: FastifyInstance) {
  const resend = new Resend(process.env.RESEND_API_KEY); // <--- Inicializar

  // 1. Solicitar Recuperação
  app.withTypeProvider<ZodTypeProvider>().post('/password/forgot', {
    schema: {
      body: z.object({ email: z.string().email() })
    }
  }, async (request, reply) => {
    const { email } = request.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Segurança: Não revelar se usuário existe ou não
      return reply.status(200).send({ message: 'Se o e-mail existir, enviamos um link.' });
    }

    const token = randomUUID();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires
      }
    });

   
    const frontUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontUrl}/reset-password?token=${token}`;

    console.log("========================================");
    console.log("🔗 LINK DE RECUPERAÇÃO (Copie e cole no navegador):");
    console.log(resetLink);
    console.log("========================================");

    // --- ENVIO REAL (RESEND) ---
    try {
      await resend.emails.send({
        from: 'RevOps Security <onboarding@resend.dev>', // Use este email de teste por enquanto
        to: email, // O email do usuário
        subject: 'Recuperação de Senha - RevOps',
        html: `
          <div style="font-family: sans-serif; font-size: 16px; color: #333;">
            <h1>Recuperação de Senha</h1>
            <p>Olá, ${user.name}.</p>
            <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova:</p>
            <p>
              <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Redefinir Minha Senha
              </a>
            </p>
            <p>Ou copie e cole este link: ${resetLink}</p>
            <p>Se não foi você, ignore este e-mail.</p>
          </div>
        `
      });
      console.log(`📧 E-mail enviado para ${email}`);
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      // Mesmo com erro no envio, retornamos 200 pro front não travar, mas logamos o erro
    }

    return reply.status(200).send({ message: 'Se o e-mail existir, enviamos um link.' });
  });

  // 2. Resetar a Senha (Mantém igual ao anterior)
  app.withTypeProvider<ZodTypeProvider>().post('/password/reset', {
    schema: {
      body: z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      })
    }
  }, async (request, reply) => {
    const { token, newPassword } = request.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return reply.status(400).send({ message: 'Link inválido ou expirado.' });
    }

    const passwordHash = await hash(newPassword, 6);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    return reply.status(200).send({ message: 'Senha alterada com sucesso!' });
  });
}
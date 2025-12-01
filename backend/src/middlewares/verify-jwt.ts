import { FastifyReply, FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({ message: 'Token missing.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'segredo-padrao');
    // @ts-ignore
    request.user = decoded; 
    
  } catch (err) {
    return reply.status(401).send({ message: 'Invalid token.' });
  }
}
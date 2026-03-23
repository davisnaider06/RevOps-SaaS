import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import axios from 'axios'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function paymentRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  // Rota para Gerar Link de Pagamento
  app.post('/payments/link', async (request, reply) => {
    // @ts-ignore
    const { sub } = request.user

    const bodySchema = z.object({
      provider: z.enum(['MERCADO_PAGO', 'KIWIFY', 'CAKTO']), // Qual gateway usar?
      amount: z.number().min(1),     // Valor em reais
      title: z.string(),             // Título do produto (ex: "Consultoria")
      leadId: z.string().optional()  // Se quiser vincular a um Lead
    })

    const { provider, amount, title, leadId } = bodySchema.parse(request.body)

    // 1. Busca as credenciais do usuário para esse gateway
    const integration = await prisma.paymentIntegration.findFirst({
      where: { 
        userId: sub, 
        provider, 
        isActive: true 
      }
    })

    if (!integration) {
      return reply.status(400).send({ 
        message: `Você não configurou a integração com ${provider} ainda.` 
      })
    }

    const creds = integration.credentials as any // O JSON salvo no banco

    // 2. Lógica específica para cada Gateway
    try {
        let paymentLink = ''
        let externalId = ''

        // --- MERCADO PAGO ---
        if (provider === 'MERCADO_PAGO') {
            if (!creds.accessToken) throw new Error('Access Token não encontrado.')

            const mpResponse = await axios.post(
                'https://api.mercadopago.com/checkout/preferences',
                {
                    items: [
                        {
                            title: title,
                            quantity: 1,
                            currency_id: 'BRL',
                            unit_price: Number(amount)
                        }
                    ],
                    // Onde o cliente volta depois de pagar
                    back_urls: {
                        success: "https://seusite.com/sucesso",
                        failure: "https://seusite.com/erro",
                        pending: "https://seusite.com/pendente"
                    },
                    auto_return: "approved",
                },
                {
                    headers: {
                        'Authorization': `Bearer ${creds.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            paymentLink = mpResponse.data.init_point // Link para pagar (checkout pro)
            externalId = mpResponse.data.id
        }
        
        // --- KIWIFY (Exemplo fictício, pois Kiwify gera link fixo geralmente) ---
        else if (provider === 'KIWIFY') {
            // Lógica da Kiwify aqui...
            paymentLink = `https://pay.kiwify.com.br/seu-link-fixo?price=${amount}`
        }

        // 3. (Opcional) Salvar no banco que geramos esse pagamento?
        // Poderia criar uma tabela 'Transaction' aqui.

        return reply.send({ 
            success: true, 
            url: paymentLink, 
            provider: provider 
        })

    } catch (error: any) {
        console.error("Erro no Gateway:", error.response?.data || error.message)
        return reply.status(500).send({ 
            message: 'Erro ao gerar link no gateway.',
            details: error.response?.data 
        })
    }
  })
}
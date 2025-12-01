import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Começando o seed...')

  // 1. Criar a Organização (Tenant)
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Agency',
      slug: 'acme-agency',
      document: '12.345.678/0001-90',
    },
  })

  // 2. Criar o Dono
  const owner = await prisma.user.create({
    data: {
      name: 'Alice CEO',
      email: 'alice@acme.com',
      password_hash: 'hash_seguro_123',
      role: 'OWNER',
      hourlyRate: 150.00,
      organizationId: org.id,
    },
  })

  // 3. Criar um Cliente
  const client = await prisma.client.create({
    data: {
      name: 'Tech Startup Inc.',
      contactName: 'Bob Founder',
      email: 'bob@tech.com',
      organizationId: org.id,
    },
  })

  // 4. Criar um Deal (Venda) ganho
  const deal = await prisma.deal.create({
    data: {
      title: 'Desenvolvimento App Mobile',
      value: 50000.00,
      status: 'WON',
      probability: 100,
      organizationId: org.id,
      clientId: client.id,
      assignedToId: owner.id,
    },
  })

  // 5. O Deal vira um Projeto
  const project = await prisma.project.create({
    data: {
      name: 'App Mobile - Tech Startup',
      status: 'ACTIVE',
      totalBudget: 50000.00,
      organizationId: org.id,
      clientId: client.id,
      originDeal: { connect: { id: deal.id } },
    },
  })

  // 6. Lançar Financeiro vinculado ao Projeto
  await prisma.financialRecord.create({
    data: {
      type: 'EXPENSE',
      description: 'Freelancer UI Design',
      amount: 2500.00,
      date: new Date(),
      status: 'PAID',
      category: 'Serviços Terceiros',
      organizationId: org.id,
      projectId: project.id,
    },
  })

  console.log('Seed finalizado com sucesso!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
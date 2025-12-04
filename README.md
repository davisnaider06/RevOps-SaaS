# 🚀 RevOps SaaS - Sistema Operacional de Receita

> **Gestão Inteligente para Prestadores de Serviços.** > CRM, Gestão de Projetos e Controle Financeiro em uma única plataforma.

![Project Status](https://img.shields.io/badge/status-MVP%20Complete-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Sobre o Projeto

O **RevOps SaaS** é uma plataforma B2B desenvolvida para agências, consultorias e empresas de serviços. Diferente de ERPs tradicionais, o foco aqui é a **inteligência de margem de lucro**.

O sistema conecta a venda (CRM) à entrega (Projetos) e ao financeiro, permitindo que o dono da empresa veja em tempo real se um contrato específico está dando lucro ou prejuízo (Burn Rate).

### ✨ Principais Funcionalidades

* **📊 Dashboard Inteligente:** Visão geral de receitas, despesas e lucro com filtros por período e gráficos interativos.
* **🤝 CRM (Pipeline de Vendas):** Quadro Kanban visual para gerenciar oportunidades (Leads) desde o contato até o fechamento.
* **🏗️ Gestão de Projetos "Raio-X":** Acompanhamento visual de orçamento consumido (Burn Rate) e margem de contribuição por projeto.
* **💸 Controle Financeiro:** Extrato completo de entradas e saídas, vinculado a clientes e projetos.
* **🌐 Portal do Cliente:** Links públicos compartilháveis onde o cliente final acompanha o status do projeto em tempo real (sem login).
* **👥 Gestão de Clientes:** Cadastro completo com histórico de projetos.
* **🔐 Segurança & Multi-tenancy:** Dados isolados por organização, autenticação JWT e recuperação de senha via e-mail.

---

## 🛠️ Tech Stack

O projeto foi construído utilizando as tecnologias mais modernas do mercado em 2025, focado em performance e escalabilidade.

### Frontend (`/web`)
* **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
* **Linguagem:** TypeScript
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes:** [Shadcn/ui](https://ui.shadcn.com/) (Radix UI)
* **Gráficos:** Recharts
* **Datas:** date-fns

### Backend (`/backend`)
* **API:** [Fastify](https://www.fastify.io/) (Node.js)
* **Linguagem:** TypeScript
* **Validação:** Zod
* **ORM:** [Prisma](https://www.prisma.io/)
* **Banco de Dados:** PostgreSQL
* **Autenticação:** JWT (JsonWebToken) & Bcrypt
* **E-mails:** Resend API

---

## 🚀 Como Rodar Localmente

Siga os passos abaixo para ter o ambiente de desenvolvimento rodando na sua máquina.

### Pré-requisitos
* Node.js (LTS v20+)
* Git
* Docker (Opcional, para rodar o banco localmente)

### 1. Clonar o Repositório
```bash
git clone [https://github.com/SEU_USUARIO/RevOps-SaaS.git](https://github.com/SEU_USUARIO/RevOps-SaaS.git)
cd RevOps-SaaS
````

### 2\. Configurar o Backend (API)

Entre na pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variáveis:

```env
# Banco de Dados (Exemplo com Docker local na porta 5433)
DATABASE_URL="postgresql://admin:password123@localhost:5433/revops_saas?schema=public"

# Segurança
JWT_SECRET="seu-segredo-super-seguro-aqui"

# Porta do Servidor
PORT=3333

# E-mails (Opcional para dev, pegue no resend.com)
RESEND_API_KEY="re_123..."
FRONTEND_URL="http://localhost:3000"
```

Suba o Banco de Dados (via Docker) e rode as migrações:

```bash
# Sobe o container do Postgres
docker-compose up -d

# Cria as tabelas no banco
npx prisma migrate dev

# (Opcional) Popula com dados iniciais
npx prisma db seed
```

Inicie o servidor:

```bash
npm run dev
# 🔥 Servidor rodando em [http://0.0.0.0:3333](http://0.0.0.0:3333)
```

### 3\. Configurar o Frontend (Web)

Abra um **novo terminal**, vá para a pasta `web` e instale as dependências:

```bash
cd web
npm install
```

Crie um arquivo `.env.local` na raiz da pasta `web`:

```env
# Aponta para o seu backend local
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Inicie o frontend:

```bash
npm run dev
# 🟢 Site rodando em http://localhost:3000
```

-----

## 📦 Estrutura do Projeto

O projeto é um monorepo simples dividido em duas pastas principais:

```
RevOps-SaaS/
├── backend/                # API RESTful (Fastify)
│   ├── prisma/             # Schema do Banco de Dados e Migrations
│   ├── src/
│   │   ├── routes/         # Rotas da API (Auth, Projects, Finance, CRM)
│   │   ├── middlewares/    # Verificação de JWT
│   │   └── server.ts       # Ponto de entrada
│
├── web/                    # Frontend (Next.js)
│   ├── src/
│   │   ├── app/            # Páginas (App Router)
│   │   │   ├── (main)/     # Rotas Privadas (Com Sidebar)
│   │   │   ├── (auth)/     # Rotas Públicas (Login/Register)
│   │   │   └── portal/     # Rota Pública do Cliente
│   │   ├── components/     # Componentes UI (Shadcn + Custom)
│   │   └── lib/            # Utilitários
```

-----

## ☁️ Deploy (Produção)

O projeto está configurado para deploy contínuo (CI/CD):

  * **Frontend:** Hospedado na **Vercel**.
  * **Backend:** Hospedado no **Render**.
  * **Banco de Dados:** Hospedado na **Neon Tech** (Serverless Postgres).

-----

## 🤝 Contribuição

1.  Faça um Fork do projeto
2.  Crie uma Branch para sua Feature (`git checkout -b feature/IncrívelFeature`)
3.  Faça o Commit (`git commit -m 'Add some IncrívelFeature'`)
4.  Faça o Push (`git push origin feature/IncrívelFeature`)
5.  Abra um Pull Request

-----
## 🌐 Link do Projeto (Live Demo)

Acesse a aplicação rodando em produção aqui:
👉 **[https://revops-saas.vercel.app](https://rev-ops-saa-s.vercel.app/)**

> **Nota:** O sistema pode demorar alguns segundos no primeiro acesso (Cold Start do Render).


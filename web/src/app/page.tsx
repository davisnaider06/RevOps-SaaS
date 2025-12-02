'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpCircle, ArrowDownCircle, DollarSign, LogOut } from 'lucide-react'
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { CreateClientDialog } from "@/components/create-client-dialog"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { TransactionsTable } from "@/components/transactions-table"


interface DashboardData {
  income: number
  expense: number
  balance: number
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Verificar se tem token
    const token = localStorage.getItem('revops-token')
    
    if (!token) {
      router.push('/login') // Se não tiver logado, manda pro login
      return
    }

    // 2. Buscar dados do Backend
    fetch('process.env.NEXT_PUBLIC_API_URL/financial-records/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(async (res) => {
      if (res.status === 401) {
        throw new Error('Token expirado')
      }
      return res.json()
    })
    .then((data) => {
      setData(data)
      setLoading(false)
    })
    .catch(() => {
      // Se der erro (token inválido), limpa e manda pro login
      localStorage.removeItem('revops-token')
      router.push('/login')
    })
  }, [router])

  function handleLogout() {
    localStorage.removeItem('revops-token')
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando painel...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">Acompanhe a saúde financeira da sua empresa.</p>
        </div>
      <div className="flex gap-2">
        <CreateTransactionDialog />
        <CreateClientDialog/>
        <CreateProjectDialog /> 
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>
    </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Receita */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Receita Total</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.income || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">+20% em relação ao mês passado</p>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.expense || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Dentro do orçamento previsto</p>
          </CardContent>
        </Card>

        {/* Saldo (Lucro) */}
        <Card className={data && data.balance >= 0 ? "bg-slate-900 text-white border-slate-900" : "bg-white"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${data && data.balance >= 0 ? "text-slate-200" : "text-slate-600"}`}>
              Lucro Líquido
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${data && data.balance >= 0 ? "text-slate-200" : "text-slate-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data && data.balance >= 0 ? "text-white" : "text-slate-900"}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.balance || 0)}
            </div>
            <p className={`text-xs mt-1 ${data && data.balance >= 0 ? "text-slate-400" : "text-slate-500"}`}>
              Margem de contribuição saudável
            </p>
          </CardContent>
        </Card>
      </div>
      <TransactionsTable />
    </div>
  )
}
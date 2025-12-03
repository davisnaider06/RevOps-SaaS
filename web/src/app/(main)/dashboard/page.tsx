'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react'
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { CreateClientDialog } from "@/components/create-client-dialog"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { TransactionsTable } from "@/components/transactions-table"
import { OverviewChart } from "@/components/overview-chart"
import { DonutChart } from "@/components/donut-chart"


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
    // Verificar se tem token
    const token = localStorage.getItem('revops-token')
    
    if (!token) {
      router.push('/login') // Se não tiver logado, manda pro login
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
    
    fetch(`${apiUrl}/financial-records/dashboard`, {
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
    .catch((err) => {
      console.error("Erro no dashboard:", err)
      // localStorage.removeItem('revops-token') 
      // router.push('/login') 
      setLoading(false) 
    })
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando painel...</div>
  }

  return (
      <><div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Visão Geral</h1>
        <p className="text-sm md:text-base text-slate-500">Acompanhe a saúde financeira da sua empresa.</p>
      </div>

      {/* Botões viram um grid no mobile para ficarem fáceis de clicar */}
      <div className="grid grid-cols-1 w-full md:w-auto md:flex gap-2">
        <CreateTransactionDialog />
        <div className="grid grid-cols-2 gap-2 md:flex">
          <CreateClientDialog />
          <CreateProjectDialog />
        </div>
      </div>
    </div><div className="min-h-screen bg-slate-50 p-8">

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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-10 ">
          <div className="md:col-span-1">
            <DonutChart />
          </div>
          <div className="grid gap-4 md:grid-cols-1">
          <OverviewChart />
        </div>
        </div>
        
        <TransactionsTable />
      </div></>
  )
}
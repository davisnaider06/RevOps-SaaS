'use client'

import { useEffect, useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface PortalData {
  name: string
  clientName: string
  status: string
  startDate: string | null
  endDate: string | null
  financials: {
    totalBudget: number
    totalUsed: number
    burnRate: number
  }
}

export default function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // URL Pública (Backend)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    // Nota: Esta rota é pública, não precisa de Header Authorization
    fetch(`${apiUrl}/portal/${token}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => setData(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Carregando portal...</div>
  
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-500 gap-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="text-lg font-medium">Portal não encontrado ou link expirado.</p>
    </div>
  )

  if (!data) return null

  // Lógica visual
  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'bg-emerald-500'
    if (status === 'COMPLETED') return 'bg-blue-500'
    return 'bg-slate-500'
  }

  const isOverBudget = data.financials.burnRate > 100

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Cabeçalho da Marca (Você pode por logo aqui) */}
        <div className="text-center mb-10">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Área do Cliente</h2>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{data.clientName}</h1>
        </div>

        {/* Card Principal */}
        <Card className="shadow-lg border-t-4 border-t-emerald-500">
            <CardHeader className="pb-4 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl text-slate-900">{data.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                            <Calendar className="h-4 w-4" />
                            {data.startDate ? new Date(data.startDate).toLocaleDateString('pt-BR') : 'Data não definida'} 
                            {' -> '}
                            {data.endDate ? new Date(data.endDate).toLocaleDateString('pt-BR') : 'Em aberto'}
                        </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(data.status)} text-white border-none px-3 py-1`}>
                        {data.status === 'ACTIVE' ? 'Em Andamento' : data.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                
                {/* Status do Orçamento (O que o cliente quer saber) */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="font-medium text-slate-700">Progresso do Orçamento</h3>
                        <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-600'}`}>
                            {data.financials.burnRate.toFixed(0)}% Utilizado
                        </span>
                    </div>
                    <Progress value={Math.min(data.financials.burnRate, 100)} className="h-3" />
                    <p className="text-xs text-slate-400 mt-2">
                        Este gráfico mostra quanto do orçamento previsto já foi consumido pelo projeto.
                    </p>
                </div>

                {/* Resumo Financeiro */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-semibold">Orçamento Total</span>
                        <div className="text-xl font-bold text-slate-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.financials.totalBudget)}
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-semibold">Consumido</span>
                        <div className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-800'}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.financials.totalUsed)}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="text-center text-sm text-slate-400">
            <p>Powered by <span className="font-bold text-slate-600">RevOps SaaS</span></p>
        </div>

      </div>
    </div>
  )
}
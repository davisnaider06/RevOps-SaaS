'use client'

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRange } from "react-day-picker" // <--- 1. Importar tipagem

interface ChartData {
  month: string
  income: number
  expense: number
}

// 2. Definir a Interface das Props
interface Props {
  dateRange: DateRange | undefined
}

// 3. Receber a prop no componente
export function OverviewChart({ dateRange }: Props) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    // 4. Montar a Query String baseada na data recebida
    let query = ""
    if (dateRange?.from && dateRange?.to) {
        query = `?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
    }

    setLoading(true)

    // 5. Usar a query na URL (com crase `)
    fetch(`${apiUrl}/financial-records/chart${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setData(data)
    })
    .finally(() => setLoading(false))
    
  }, [dateRange]) // <--- 6. Importante: Adicionar dateRange nas dependências para recarregar quando mudar

  if (loading) return <div className="h-[350px] flex items-center justify-center text-slate-400">Carregando gráfico...</div>

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center text-slate-400">
          Sem dados suficientes neste período.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="month" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `R$${value}`} 
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
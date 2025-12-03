'use client'

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { DateRange } from "react-day-picker" 

interface ChartData {
  name: string
  value: number
  color: string
  [key: string]: any
}

interface Props {
  dateRange: DateRange | undefined
}

export function DonutChart({ dateRange }: Props) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    // Monta a Query String com as datas
    let query = ""
    if (dateRange?.from && dateRange?.to) {
        query = `?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
    }

    setLoading(true)

    // Usa a query na URL
    fetch(`${apiUrl}/financial-records/donut-chart${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setData(data)
    })
    .finally(() => setLoading(false))
    
  }, [dateRange])

  if (loading) {
    return (
      <Card className="h-[350px] flex items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    )
  }

  const totalValue = data.reduce((acc, cur) => acc + cur.value, 0);

  if (totalValue === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balanço do Período</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-slate-400 text-sm text-center px-4">
          Sem movimentações neste período.
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-sm">
          <p className="font-bold" style={{ color: data.color }}>{data.name}</p>
          <p className="text-slate-600">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balanço do Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative">
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm text-slate-500 font-medium">Movimentado</span>
                <span className="text-2xl font-bold text-slate-900">
                    {formatCurrency(totalValue)}
                </span>
           </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend verticalAlign="bottom" height={36} iconType="circle"/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
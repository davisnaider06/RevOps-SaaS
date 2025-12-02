'use client'

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  project?: { name: string }
}

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const token = localStorage.getItem('revops-token')
    
    fetch('process.env.NEXT_PUBLIC_API_URL/financial-records', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setTransactions(data)
    })
  }, [])

  if (transactions.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center text-slate-500">
          Nenhuma transação registrada ainda.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Últimas Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  {t.description}
                  <span className="block text-xs text-slate-400 font-normal">
                    {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </span>
                </TableCell>
                <TableCell>
                  {t.project?.name || '-'}
                </TableCell>
                <TableCell>
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className={`text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'EXPENSE' ? '- ' : '+ '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
'use client'

import { useEffect, useState } from "react"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { Trash2, TrendingUp, TrendingDown, Filter } from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  project?: { name: string }
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL") // ALL, INCOME, EXPENSE

  // Função para buscar TODOS os dados
  function loadTransactions() {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    fetch(`${apiUrl}/financial-records?limit=all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setTransactions(data)
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza?")) return
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      await fetch(`${apiUrl}/financial-records/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      loadTransactions()
    } catch (err) {
      alert("Erro ao apagar.")
    }
  }

  // Filtragem local
  const filteredData = transactions.filter(t => {
    if (filter === "ALL") return true
    return t.type === filter
  })

  // Totais da página atual
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500">Gestão completa de fluxo de caixa.</p>
        </div>
        <CreateTransactionDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entradas Totais</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saídas Totais</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Extrato</CardTitle>
                <Tabs defaultValue="ALL" className="w-[400px]" onValueChange={setFilter}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ALL">Tudo</TabsTrigger>
                        <TabsTrigger value="INCOME">Receitas</TabsTrigger>
                        <TabsTrigger value="EXPENSE">Despesas</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="text-center p-8 text-slate-500">Carregando extrato...</div>
            ) : filteredData.length === 0 ? (
                <div className="text-center p-8 text-slate-500 border-2 border-dashed rounded-lg">
                    Nenhum lançamento encontrado neste filtro.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Projeto</TableHead>
                                <TableHead className="hidden sm:table-cell">Data</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">
                                        {t.description}
                                        <span className="block text-xs text-slate-400 sm:hidden">
                                            {new Date(t.date).toLocaleDateString('pt-BR')}
                                        </span>
                                    </TableCell>
                                    <TableCell>{t.project?.name || '-'}</TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {t.type === 'EXPENSE' ? '- ' : '+ '}
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-1">
                                        <EditTransactionDialog transaction={t} onSuccess={loadTransactions} />
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useEffect, useState } from "react"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { FixedExpenseDialog, type FixedExpense } from "@/components/fixed-expense-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import {
  CalendarClock,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  projectId?: string | null
  project?: { name: string }
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [loadingFixedExpenses, setLoadingFixedExpenses] = useState(true)
  const [filter, setFilter] = useState("ALL")

  function getApiUrl() {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
  }

  function getAuthHeaders() {
    const token = localStorage.getItem('revops-token')
    return { 'Authorization': `Bearer ${token}` }
  }

  async function loadTransactions() {
    setLoadingTransactions(true)

    try {
      const response = await fetch(`${getApiUrl()}/financial-records?limit=all`, {
        headers: getAuthHeaders(),
      })
      const data = await response.json()

      if (Array.isArray(data)) {
        setTransactions(data)
      }
    } finally {
      setLoadingTransactions(false)
    }
  }

  async function loadFixedExpenses() {
    setLoadingFixedExpenses(true)

    try {
      const response = await fetch(`${getApiUrl()}/fixed-expenses`, {
        headers: getAuthHeaders(),
      })
      const data = await response.json()

      if (Array.isArray(data)) {
        setFixedExpenses(data)
      }
    } finally {
      setLoadingFixedExpenses(false)
    }
  }

  useEffect(() => {
    loadTransactions()
    loadFixedExpenses()
  }, [])

  async function handleDeleteTransaction(id: string) {
    if (!window.confirm("Tem certeza que deseja apagar esse lancamento?")) return

    try {
      await fetch(`${getApiUrl()}/financial-records/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      loadTransactions()
    } catch (error) {
      alert("Erro ao apagar lancamento.")
    }
  }

  async function handleDeleteFixedExpense(id: string) {
    if (!window.confirm("Tem certeza que deseja apagar esse gasto fixo?")) return

    try {
      await fetch(`${getApiUrl()}/fixed-expenses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      loadFixedExpenses()
    } catch (error) {
      alert("Erro ao apagar gasto fixo.")
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "ALL") return true
    return transaction.type === filter
  })

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((accumulator, transaction) => accumulator + Number(transaction.amount), 0)

  const totalExpense = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((accumulator, transaction) => accumulator + Number(transaction.amount), 0)

  const activeFixedExpenses = fixedExpenses.filter((expense) => expense.isActive)
  const fixedExpenseMonthlyTotal = activeFixedExpenses.reduce(
    (accumulator, expense) => accumulator + Number(expense.amount),
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500">
            Controle seu extrato e acompanhe gastos fixos mensais em um so lugar.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <FixedExpenseDialog
            onSuccess={loadFixedExpenses}
            trigger={
              <Button variant="outline" className="border-slate-300">
                <Plus className="mr-2 h-4 w-4" />
                Novo gasto fixo
              </Button>
            }
          />
          <CreateTransactionDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas totais</CardTitle>
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
            <CardTitle className="text-sm font-medium">Saidas totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos fixos mensais</CardTitle>
            <Receipt className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fixedExpenseMonthlyTotal)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Soma dos gastos fixos atualmente ativos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cadastros ativos</CardTitle>
            <CalendarClock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {activeFixedExpenses.length}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Despesas recorrentes prontas para acompanhar todo mes.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-[360px]">
          <TabsTrigger value="statement">Extrato</TabsTrigger>
          <TabsTrigger value="fixed-expenses">Gastos fixos</TabsTrigger>
        </TabsList>

        <TabsContent value="statement">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Extrato financeiro</CardTitle>
                  <CardDescription>
                    Acompanhe receitas e despesas lancadas manualmente.
                  </CardDescription>
                </div>

                <Tabs defaultValue="ALL" className="w-full lg:w-[400px]" onValueChange={setFilter}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ALL">Tudo</TabsTrigger>
                    <TabsTrigger value="INCOME">Receitas</TabsTrigger>
                    <TabsTrigger value="EXPENSE">Despesas</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent>
              {loadingTransactions ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-500">
                  Carregando extrato...
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
                  Nenhum lancamento encontrado neste filtro.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descricao</TableHead>
                        <TableHead>Projeto</TableHead>
                        <TableHead className="hidden sm:table-cell">Data</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-[100px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.description}
                            <span className="block text-xs text-slate-400 sm:hidden">
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.project?.name || '-'}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className={`text-right font-bold ${transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {transaction.type === 'EXPENSE' ? '- ' : '+ '}
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(transaction.amount))}
                          </TableCell>
                          <TableCell className="flex justify-end gap-1">
                            <EditTransactionDialog transaction={transaction} onSuccess={loadTransactions} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
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
        </TabsContent>

        <TabsContent value="fixed-expenses">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Gastos fixos e recorrentes</CardTitle>
                <CardDescription>
                  Cadastre despesas mensais para nao perder o controle dos custos base da operacao.
                </CardDescription>
              </div>

              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                {activeFixedExpenses.length} ativos
              </Badge>
            </CardHeader>

            <CardContent>
              {loadingFixedExpenses ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-slate-500">
                  Carregando gastos fixos...
                </div>
              ) : fixedExpenses.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">
                  Nenhum gasto fixo cadastrado ainda. Use "Novo gasto fixo" para comecar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor mensal</TableHead>
                        <TableHead className="w-[110px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fixedExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {expense.name}
                            {expense.description ? (
                              <span className="block text-xs text-slate-400">
                                {expense.description}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell>{expense.category || '-'}</TableCell>
                          <TableCell>Dia {expense.dueDay}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={expense.isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-600"}
                            >
                              {expense.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(expense.amount))}
                          </TableCell>
                          <TableCell className="flex justify-end gap-1">
                            <FixedExpenseDialog
                              fixedExpense={expense}
                              onSuccess={loadFixedExpenses}
                              trigger={
                                <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteFixedExpense(expense.id)}
                            >
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

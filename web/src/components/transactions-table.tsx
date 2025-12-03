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
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

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

  // Função para buscar dados
  function loadTransactions() {
    const token = localStorage.getItem('revops-token')
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/financial-records`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setTransactions(data)
    })
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  // Função para Deletar
  async function handleDelete(id: string) {
    const confirm = window.confirm("Tem certeza que deseja apagar essa transação?")
    if (!confirm) return

    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      await fetch(`${apiUrl}/financial-records/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      alert("Transação apagada!")
      // Recarrega a lista sem precisar dar F5 na página toda
      loadTransactions() 
      // Opcional: Recarregar a página toda para atualizar os Cards de Saldo também
      window.location.reload()

    } catch (err) {
      alert("Erro ao apagar.")
    }
  }

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
        <div className="overflow-x-auto w-full"> 
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead> 
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {t.description}
                    <span className="block text-xs text-slate-400 font-normal sm:hidden">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="block text-xs text-slate-400 font-normal sm:hidden">
                       {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {t.project?.name || '-'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className={`text-right font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'EXPENSE' ? '- ' : '+ '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div> 
      </CardContent>
    </Card>
  )
}
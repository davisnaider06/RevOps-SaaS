'use client'

import { useEffect, useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { ShareProjectDialog } from "@/components/share-project-dialog"

interface ProjectDetails {
  id: string
  name: string
  status: string
  totalBudget: string
  shareToken?: string | null
  client: { name: string; email?: string }
  stats: {
    totalIncome: number
    totalExpense: number
    balance: number
    burnRate: number
  }
  transactions: any[]
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  // Função para recarregar dados (passada para os modais atualizarem a tela)
  function refreshData() {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    fetch(`${apiUrl}/projects/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(async res => {
      if (!res.ok) throw new Error('Erro ao carregar')
      return res.json()
    })
    .then(data => setProject(data))
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshData()
  }, [id])

  if (loading) return <div className="p-8 text-slate-500">Carregando raio-x...</div>
  if (error) return <div className="p-8 text-red-500">Erro: {error}</div>
  if (!project) return null

  // Lógica de cor da barra
  const getProgressColor = (percent: number) => {
    if (percent > 100) return "bg-red-600"
    if (percent > 80) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* --- BLOCO 1: CABEÇALHO (Título e Botões) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/projects"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                    <Badge className="text-sm" variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {project.status}
                    </Badge>
                </div>
                <p className="text-slate-500 mt-1">
                    Cliente: <span className="font-medium text-slate-900">{project.client?.name || 'Desconhecido'}</span>
                </p>
            </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-3">
            <ShareProjectDialog projectId={project.id} currentShareToken={project.shareToken} />
            {/* O botão recebe defaultProjectId para já abrir selecionado */}
            <CreateTransactionDialog defaultProjectId={project.id} />
        </div>
      </div>

      {/* --- BLOCO 2: ORÇAMENTO (Barra de Progresso) --- */}
      <Card>
        <CardHeader className="pb-2">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <CardTitle className="text-base font-medium text-slate-600">Consumo do Orçamento</CardTitle>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(project.totalBudget))}
                    </p>
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded ${project.stats.burnRate > 100 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
                    {project.stats.burnRate.toFixed(1)}% Gasto
                </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${getProgressColor(project.stats.burnRate)}`} 
                    style={{ width: `${Math.min(project.stats.burnRate, 100)}%` }}
                />
            </div>
        </CardHeader>
      </Card>

      {/* --- BLOCO 3: KPIs (Indicadores) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Receita (Entradas)</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.stats.totalIncome)}
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Custo Real (Saídas)</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.stats.totalExpense)}
                </div>
            </CardContent>
        </Card>

        <Card className={project.stats.balance >= 0 ? "bg-slate-900 text-white" : "bg-red-50 border-red-200"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${project.stats.balance >= 0 ? "text-slate-300" : "text-red-700"}`}>
                    Resultado (Lucro)
                </CardTitle>
                <DollarSign className={`h-4 w-4 ${project.stats.balance >= 0 ? "text-slate-300" : "text-red-600"}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${project.stats.balance >= 0 ? "text-white" : "text-red-600"}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.stats.balance)}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* --- BLOCO 4: TABELA (Extrato) --- */}
      <Card>
        <CardHeader>
            <CardTitle>Extrato Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
            {project.transactions.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg text-slate-400 text-sm">
                    Nenhuma movimentação financeira registrada neste projeto.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {project.transactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell className="text-slate-500">
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
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
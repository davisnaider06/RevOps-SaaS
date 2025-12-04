'use client'

import { useEffect, useState, use } from "react" // 'use' é necessário para params no Next 15+
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Tipos dos dados
interface ProjectDetails {
  id: string
  name: string
  status: string
  totalBudget: string
  startDate: string | null
  client: { name: string; email?: string }
  stats: {
    totalIncome: number
    totalExpense: number
    balance: number
    burnRate: number
  }
  transactions: any[]
}

// Recebendo params como Promise
export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Desembrulha a promise dos parametros
  const { id } = use(params);
  
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    fetch(`${apiUrl}/projects/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao carregar')
      return res.json()
    })
    .then(data => setProject(data))
    .catch(() => router.push('/projects')) // Se der erro, volta pra lista
    .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return <div className="p-8 text-slate-500">Carregando raio-x do projeto...</div>
  if (!project) return null

  // Lógica de cor da barra de progresso
  const getProgressColor = (percent: number) => {
    if (percent > 100) return "bg-red-600" // Estourou
    if (percent > 80) return "bg-yellow-500" // Alerta
    return "bg-emerald-500" // Seguro
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
                <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>{project.status}</Badge>
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                <span className="font-medium text-slate-700">{project.client.name}</span> • 
                Orçamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(project.totalBudget))}
            </p>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-2">
            <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Orçamento Consumido (Custos)</span>
                <span className={project.stats.burnRate > 100 ? "text-red-600 font-bold" : "text-slate-700"}>
                    {project.stats.burnRate.toFixed(1)}%
                </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all ${getProgressColor(project.stats.burnRate)}`} 
                    style={{ width: `${Math.min(project.stats.burnRate, 100)}%` }}
                />
            </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Receita Faturada</CardTitle>
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
                <CardTitle className="text-sm font-medium text-slate-500">Custos Reais</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.stats.totalExpense)}
                </div>
            </CardContent>
        </Card>

        <Card className={project.stats.balance >= 0 ? "bg-slate-900 text-white border-none" : "bg-red-50 border-red-200"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${project.stats.balance >= 0 ? "text-slate-300" : "text-red-700"}`}>
                    Margem de Lucro
                </CardTitle>
                <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${project.stats.balance >= 0 ? "text-white" : "text-red-600"}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.stats.balance)}
                </div>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Extrato do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
            {project.transactions.length === 0 ? (
                <div className="text-center p-6 text-slate-400 text-sm">Nenhuma transação lançada neste projeto.</div>
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
                                    <TableCell>{t.description}</TableCell>
                                    <TableCell>{new Date(t.date).toLocaleDateString('pt-BR')}</TableCell>
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
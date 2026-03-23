'use client'

import { useEffect, useState } from "react"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Folder, User, Calendar } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  status: string
  totalBudget: number | string // Pode vir como string do banco
  client: { name: string }
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Função para buscar projetos
  function loadProjects() {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    fetch(`${apiUrl}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setProjects(data)
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProjects()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projetos</h1>
          <p className="text-slate-500">Gerencie seus contratos ativos e entregas.</p>
        </div>
        <CreateProjectDialog /> 
      </div>

      {/* Grid de Projetos */}
      {loading ? (
        <div className="text-slate-500 p-4 text-center">Carregando projetos...</div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-lg text-slate-400 bg-slate-50/50">
          Você ainda não tem projetos. Clique no botão acima para criar o primeiro!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block group">
              <Card className="h-full hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer bg-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Folder className="h-5 w-5 text-slate-600 group-hover:text-white" />
                    </div>
                    <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {project.status === 'ACTIVE' ? 'Em Andamento' : project.status}
                    </Badge>
                  </div>
                  
                  <CardTitle className="mt-4 text-xl leading-tight group-hover:text-emerald-700 transition-colors">
                    {project.name}
                  </CardTitle>
                  
                  <CardDescription className="flex items-center mt-1 text-xs">
                    <User className="h-3 w-3 mr-1" /> {project.client?.name || 'Cliente desconhecido'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="pt-4 border-t flex items-center justify-between text-sm">
                    <div className="text-slate-500 flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(project.totalBudget))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from "react"
import { CreateLeadDialog } from "@/components/create-lead-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, DollarSign, ArrowRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Tipos
interface Lead {
  id: string
  title: string
  contactName: string
  value: number
  status: 'NEW' | 'CONTACT' | 'PROPOSAL' | 'WON' | 'LOST'
  createdAt: string
}

// Configuração das Colunas
const COLUMNS = [
  { id: 'NEW', label: 'Novos', color: 'bg-blue-500' },
  { id: 'CONTACT', label: 'Em Contato', color: 'bg-yellow-500' },
  { id: 'PROPOSAL', label: 'Proposta', color: 'bg-purple-500' },
  { id: 'WON', label: 'Ganho', color: 'bg-emerald-500' },
  { id: 'LOST', label: 'Perdido', color: 'bg-red-500' },
]

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  // Função para buscar leads
  function loadLeads() {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    fetch(`${apiUrl}/leads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setLeads(data)
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLeads()
  }, [])

  // Função para mover lead (Mudar status)
  async function moveLead(id: string, newStatus: string) {
    // Atualização Otimista (Muda na tela antes de confirmar no back)
    const oldLeads = [...leads]
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as any } : l))

    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      await fetch(`${apiUrl}/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (err) {
      alert("Erro ao mover lead")
      setLeads(oldLeads) // Desfaz se der erro
    }
  }

  // Função auxiliar para somar valor da coluna
  const getColumnTotal = (status: string) => {
    return leads
      .filter(l => l.status === status)
      .reduce((acc, curr) => acc + Number(curr.value || 0), 0)
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CRM / Pipeline</h1>
          <p className="text-slate-500">Gerencie suas oportunidades de venda.</p>
        </div>
        <CreateLeadDialog onSuccess={loadLeads} />
      </div>

      {/* Área do Kanban (Com rolagem horizontal) */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px] h-full"> {/* Largura mínima pra não espremer */}
          
          {COLUMNS.map(col => (
            <div key={col.id} className="flex-1 min-w-[280px] bg-slate-100/50 rounded-lg p-3 border border-slate-200 flex flex-col">
              
              {/* Cabeçalho da Coluna */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${col.color}`} />
                    <span className="font-semibold text-slate-700">{col.label}</span>
                    <Badge variant="outline" className="bg-white text-xs">
                        {leads.filter(l => l.status === col.id).length}
                    </Badge>
                </div>
              </div>
              
              {/* Valor Total da Coluna */}
              <div className="mb-4 text-xs font-medium text-slate-500 pl-5">
                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getColumnTotal(col.id))}
              </div>

              {/* Lista de Cards */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-250px)]">
                {leads.filter(lead => lead.status === col.id).map(lead => (
                  <Card key={lead.id} className="shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-bold text-slate-800 leading-tight">
                            {lead.title}
                        </CardTitle>
                        {/* Se tiver valor, mostra */}
                        {Number(lead.value) > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1 h-5 text-emerald-700 bg-emerald-50 border-emerald-100">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(Number(lead.value))}
                            </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-3 pt-2">
                        <div className="flex flex-col gap-1 text-xs text-slate-500 mb-3">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {lead.contactName}
                            </div>
                            {(lead.email || lead.phone) && (
                                <div className="flex items-center gap-1 opacity-80">
                                    <Phone className="h-3 w-3" /> Contato disponível
                                </div>
                            )}
                        </div>

                        {/* Seletor para Mover de Coluna */}
                        <Select 
                            defaultValue={lead.status} 
                            onValueChange={(val) => moveLead(lead.id, val)}
                        >
                            <SelectTrigger className="h-7 text-xs w-full bg-slate-50 border-slate-200 focus:ring-0">
                                <SelectValue placeholder="Mover para..." />
                            </SelectTrigger>
                            <SelectContent>
                                {COLUMNS.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                  </Card>
                ))}
                
                {leads.filter(lead => lead.status === col.id).length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-md text-slate-400 text-xs">
                        Vazio
                    </div>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
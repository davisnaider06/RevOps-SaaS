'use client'

import { useEffect, useState } from "react"
import { CreateLeadDialog } from "@/components/create-lead-dialog"
import { KanbanBoard } from "@/components/crm/kanban/KanbanBoard" // Importe o componente novo
import { Loader2 } from "lucide-react"
import { PixPaymentModal } from "@/components/pix-payment-modal"

// Importe o tipo Lead do KanbanCard para garantir consistência
import { Lead } from "@/components/crm/kanban/KanbanCard"
import { GeneratePaymentModal } from "@/components/generate-payment-modal"

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  // Função para buscar leads
  function loadLeads() {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    setLoading(true)
    fetch(`${apiUrl}/leads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setLeads(data)
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLeads()
  }, [])

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CRM / Pipeline</h1>
          <p className="text-slate-500">Gerencie suas oportunidades de venda.</p>
        </div>
        <CreateLeadDialog onSuccess={loadLeads} />
      </div>

      {/* Área do Kanban */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
            <><div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div></>
        ) : (
            // AQUI ESTÁ A MUDANÇA PRINCIPAL
            <KanbanBoard initialLeads={leads} />
        )}
      </div>
    </div>
  )
}
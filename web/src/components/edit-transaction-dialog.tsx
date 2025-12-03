'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Loader2, Pencil } from "lucide-react"

interface Project {
  id: string
  name: string
}

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  projectId?: string | null
}

interface Props {
  transaction: Transaction
  onSuccess: () => void
}

export function EditTransactionDialog({ transaction, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Estados preenchidos com os dados iniciais
  const [description, setDescription] = useState(transaction.description)
  const [amount, setAmount] = useState(String(transaction.amount))
  const [type, setType] = useState(transaction.type)
  const [date, setDate] = useState(transaction.date.split('T')[0]) // Formata para YYYY-MM-DD
  const [selectedProjectId, setSelectedProjectId] = useState(transaction.projectId || "")
  
  const [projects, setProjects] = useState<Project[]>([])

  // Busca projetos ao abrir
  useEffect(() => {
    if (open) {
      const token = localStorage.getItem('revops-token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      
      fetch(`${apiUrl}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setProjects(data)
      })
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

    try {
      await fetch(`${apiUrl}/financial-records/${transaction.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          type,
          date: new Date(date).toISOString(),
          projectId: selectedProjectId || null
        }),
      })

      setOpen(false)
      onSuccess() // Atualiza a tabela pai
      alert("Transação atualizada!")

    } catch (err) {
      alert("Erro ao editar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 mr-2"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar Transação</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              
              <div className="flex gap-4 justify-center">
                <Button 
                  type="button"
                  variant={type === 'INCOME' ? 'default' : 'outline'}
                  onClick={() => setType('INCOME')}
                  className={type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Receita
                </Button>
                <Button 
                  type="button"
                  variant={type === 'EXPENSE' ? 'destructive' : 'outline'}
                  onClick={() => setType('EXPENSE')}
                >
                  Despesa
                </Button>
              </div>

              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label>Valor (R$)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label>Data</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>

              <div className="grid gap-2">
                <Label>Vincular ao Projeto</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Sem projeto</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
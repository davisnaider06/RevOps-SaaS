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
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Loader2, DollarSign } from "lucide-react"

interface Project {
  id: string
  name: string
}

export function CreateTransactionDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Campos do formulário
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME")
  const [date, setDate] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState("")
  
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
        setProjects(data)
        if (data.length > 0) setSelectedProjectId(data[0].id)
      })
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('revops-token')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      await fetch(`${apiUrl}/financial-records`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          amount: Number(amount),
          type,
          date: new Date(date).toISOString(), // Formata data para o Backend
          projectId: selectedProjectId || undefined // Se vazio, manda undefined
        }),
      })

      setOpen(false)
      setDescription("")
      setAmount("")
      alert("Transação lançada!")
      window.location.reload()

    } catch (err) {
      alert("Erro ao lançar transação.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <DollarSign className="mr-2 h-4 w-4" /> Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Lançar Financeiro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            {/* Tipo (Receita ou Despesa) */}
            <div className="flex gap-4 justify-center">
              <Button 
                type="button"
                variant={type === 'INCOME' ? 'default' : 'outline'}
                onClick={() => setType('INCOME')}
                className={type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                Receita (Entrada)
              </Button>
              <Button 
                type="button"
                variant={type === 'EXPENSE' ? 'destructive' : 'outline'}
                onClick={() => setType('EXPENSE')}
              >
                Despesa (Saída)
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
              <Label>Vincular ao Projeto (Opcional)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">Sem projeto (Custo fixo)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
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
import { Loader2, Plus } from "lucide-react"

// Tipo para o cliente
interface Client {
  id: string
  name: string
}

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  
  // Estado para armazenar clientes e o cliente selecionado
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")

  // Busca os clientes assim que abre o modal
  useEffect(() => {
    if (open) {
      setLoading(true) // Mostra que está carregando
      const token = localStorage.getItem('revops-token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
      
      fetch(`${apiUrl}/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setClients(data)
            // Se tiver clientes e nenhum selecionado, seleciona o primeiro
            if (data.length > 0 && !selectedClientId) {
                setSelectedClientId(data[0].id)
            }
        }
      })
      .catch(err => console.error("Erro ao buscar clientes:", err))
      .finally(() => setLoading(false))
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('revops-token')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
     const response = await fetch(`${apiUrl}/projects`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          totalBudget: Number(budget),
          clientId: selectedClientId // <--- Agora usamos o ID selecionado
        }),
      })

      if (!response.ok) throw new Error('Erro')

      setOpen(false)
      setName("")
      setBudget("")
      setSelectedClientId("")
      alert("Projeto criado com sucesso!")
      window.location.reload()

    } catch (err) {
      alert("Erro ao criar projeto.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Projeto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Campo Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            {/* Campo Orçamento */}
            <div className="grid gap-2">
              <Label htmlFor="budget">Orçamento Total (R$)</Label>
              <Input 
                id="budget" 
                type="number" 
                value={budget} 
                onChange={(e) => setBudget(e.target.value)} 
                required 
              />
            </div>

            {/* Campo Seleção de Cliente */}
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente</Label>
              {/* Usamos um select nativo estilizado para simplificar a integração com a lista */}
              <select
                id="client"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                required
              >
                {clients.length === 0 ? (
                  <option value="">Nenhum cliente encontrado</option>
                ) : (
                  clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))
                )}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-red-500">
                  Você precisa criar um cliente primeiro!
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || clients.length === 0}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
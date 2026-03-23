'use client'

import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export interface FixedExpense {
  id: string
  name: string
  description?: string | null
  amount: number
  category?: string | null
  dueDay: number
  isActive: boolean
}

interface FixedExpenseDialogProps {
  fixedExpense?: FixedExpense
  onSuccess: () => void
  trigger: ReactNode
}

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
]

export function FixedExpenseDialog({
  fixedExpense,
  onSuccess,
  trigger,
}: FixedExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [dueDay, setDueDay] = useState("5")
  const [status, setStatus] = useState("active")

  useEffect(() => {
    if (!open) return

    setName(fixedExpense?.name || "")
    setDescription(fixedExpense?.description || "")
    setAmount(fixedExpense ? String(fixedExpense.amount) : "")
    setCategory(fixedExpense?.category || "")
    setDueDay(fixedExpense ? String(fixedExpense.dueDay) : "5")
    setStatus(fixedExpense?.isActive === false ? "inactive" : "active")
  }, [fixedExpense, open])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
    const endpoint = fixedExpense
      ? `${apiUrl}/fixed-expenses/${fixedExpense.id}`
      : `${apiUrl}/fixed-expenses`

    try {
      const response = await fetch(endpoint, {
        method: fixedExpense ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          amount: Number(amount),
          category: category || undefined,
          dueDay: Number(dueDay),
          isActive: status === 'active',
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setOpen(false)
      onSuccess()
    } catch (error) {
      alert("Nao foi possivel salvar o gasto fixo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {fixedExpense ? "Editar gasto fixo" : "Novo gasto fixo"}
            </DialogTitle>
            <DialogDescription>
              Cadastre despesas recorrentes como aluguel, softwares, contador e equipe fixa.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="fixed-expense-name">Nome</Label>
              <Input
                id="fixed-expense-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Assinatura do CRM"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fixed-expense-amount">Valor mensal (R$)</Label>
              <Input
                id="fixed-expense-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fixed-expense-due-day">Dia do vencimento</Label>
              <Input
                id="fixed-expense-due-day"
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(event) => setDueDay(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fixed-expense-category">Categoria</Label>
              <Input
                id="fixed-expense-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Ex: Operacional"
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="fixed-expense-description">Observacoes</Label>
              <Input
                id="fixed-expense-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: vence no boleto todo dia 10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

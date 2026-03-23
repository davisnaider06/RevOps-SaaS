'use client'

import { useState } from "react"
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"

export function CreateProductDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Campos
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [type, setType] = useState<"GOOD" | "SERVICE">("GOOD")
  const [stockQuantity, setStockQuantity] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
            name, 
            price: Number(price),
            costPrice: Number(costPrice) || undefined,
            type,
            stockQuantity: type === 'GOOD' ? Number(stockQuantity) : undefined
        }),
      })

      setOpen(false)
      setName(""); setPrice(""); setStockQuantity("");
      onSuccess() 
      alert("Item cadastrado!")

    } catch (err) {
      alert("Erro ao cadastrar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cadastrar Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid gap-2">
              <Label>Nome do Item</Label>
              <Input placeholder="Ex: Corte de Cabelo ou Shampoo" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select value={type} onValueChange={(val: any) => setType(val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GOOD">Produto Físico</SelectItem>
                            <SelectItem value="SERVICE">Serviço</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Só mostra Estoque se for Produto Físico */}
                {type === 'GOOD' && (
                    <div className="grid gap-2">
                        <Label>Estoque Inicial</Label>
                        <Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Preço de Venda (R$)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                    <Label>Custo (Opcional)</Label>
                    <Input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" />
                </div>
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
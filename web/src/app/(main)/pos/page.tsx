'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Search, ShoppingCart, Trash2, Loader2, Minus, Plus,  CreditCard, Banknote, QrCode } from "lucide-react"

import { ClipboardList } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PixPaymentModal } from "@/components/pix-payment-modal"

interface Product {
  id: string
  name: string
  price: number
  type: 'GOOD' | 'SERVICE'
  stockQuantity: number
}

interface CartItem extends Product {
  quantity: number
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro")

  const [dailySummary, setDailySummary] = useState<{product: string, quantity: number}[]>([])

  async function loadDailySummary() {
  const token = localStorage.getItem('revops-token')
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

  try {
    const res = await fetch(`${apiUrl}/sales/summary`, {
       headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setDailySummary(data)
  } catch (err) {
    console.error(err)
  }
}
  // Carrega catálogo
  useEffect(() => {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    fetch(`${apiUrl}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setProducts(data) })
  }, [])

  // Adicionar ao carrinho
  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  // Remover/Diminuir
  function removeFromCart(id: string) {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.id === id) {
        if (item.quantity > 1) return [...acc, { ...item, quantity: item.quantity - 1 }]
        return acc // Remove se for 1
      }
      return [...acc, item]
    }, [] as CartItem[]))
  }

  // Finalizar Venda
  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      const itemsPayload = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))

      const res = await fetch(`${apiUrl}/products/checkout`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          items: itemsPayload,
          paymentMethod})
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message)
      }

      alert("Venda realizada com sucesso!")
      setCart([]) // Limpa carrinho

    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const total = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0)
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      
      {/* Esquerda: Catálogo */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                    placeholder="Buscar item..." 
                    className="pl-9" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2 text-slate-600 hover:text-emerald-600"
                    onClick={loadDailySummary}
                  >
                     <ClipboardList className="h-4 w-4" /> 
                     <span className="hidden sm:inline">Resumo do Dia</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sincronização de Estoque</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                      <p className="text-sm text-slate-500">
                          Abaixo estão os itens vendidos hoje. Use esta lista para dar baixa no seu sistema antigo.
                      </p>
                      
                      <div className="bg-slate-50 p-4 rounded-md border text-sm max-h-[300px] overflow-y-auto">
                          {dailySummary.length === 0 ? (
                              <p className="text-slate-400 text-center italic">Nenhuma venda registrada hoje.</p>
                          ) : (
                              <ul className="space-y-2">
                                  {dailySummary.map((item, idx) => (
                                      <li key={idx} className="flex justify-between border-b border-slate-200 pb-1 last:border-0">
                                          <span className="font-medium text-slate-700">{item.product}</span>
                                          <span className="font-bold text-emerald-600">{item.quantity} un.</span>
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </div>

                      {dailySummary.length > 0 && (
                        <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => {
                                const text = dailySummary.map(i => `${i.quantity}x ${i.product}`).join('\n')
                                navigator.clipboard.writeText(text)
                                alert("Lista copiada!")
                            }}
                        >
                            Copiar Lista
                        </Button>
                      )}
                  </div>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto content-start">
            {filteredProducts.map(product => (
                <Card 
                    key={product.id} 
                    className="cursor-pointer hover:border-emerald-500 transition-all hover:shadow-md"
                    onClick={() => addToCart(product)}
                >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">
                            {product.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="font-medium leading-tight">{product.name}</div>
                        <div className="text-emerald-600 font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                        </div>
                        {product.type === 'GOOD' && (
                            <Badge variant="secondary" className="text-[10px]">
                                {product.stockQuantity} un.
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

      {/* Direita: Carrinho */}
      <Card className="w-full md:w-[350px] flex flex-col h-full border-l-4 border-l-emerald-500">
        <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Carrinho
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <p>Carrinho vazio.</p>
                    <p className="text-xs">Clique nos itens para adicionar.</p>
                </div>
            ) : (
                <div className="divide-y">
                    {cart.map(item => (
                        <div key={item.id} className="p-4 flex justify-between items-center">
                            <div className="flex-1">
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-slate-500">
                                    {item.quantity} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.price))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => removeFromCart(item.id)}>
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => addToCart(item)}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
        
      {/* Rodapé do Carrinho */}
        <div className="p-4 bg-slate-50 border-t space-y-4">

            {/* Seletor de Pagamento */}
            <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Forma de Pagamento</span>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dinheiro">💵 Dinheiro</SelectItem>
                        <SelectItem value="Pix">💠 Pix</SelectItem>
                        <SelectItem value="Crédito">💳 Cartão de Crédito</SelectItem>
                        <SelectItem value="Débito">💳 Cartão de Débito</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* --- INTEGRAÇÃO DO PIX AQUI --- */}
            {/* Só mostra se tiver itens E a forma de pagamento for Pix */}
            {paymentMethod === 'Pix' && total > 0 && (
                <div className="pt-2">
                    <PixPaymentModal 
                        defaultAmount={total} 
                        leadName="Venda Balcão"
                    />
                    <Button variant="outline" className="w-full gap-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 bg-white border-dashed">
                        <QrCode className="h-4 w-4" /> 
                        Gerar QR Code de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </Button>
                    <p className="text-[10px] text-center text-slate-400 mt-1">
                        Gere o código para o cliente pagar antes de finalizar.
                    </p>
                </div>
            )}
            {/* ------------------------------- */}

            <div className="flex justify-between items-center pt-2">
                <span className="text-slate-600">Total</span>
                <span className="text-2xl font-bold text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                </span>
            </div>

            <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6" 
                disabled={cart.length === 0 || loading}
                onClick={handleCheckout}
            >
                {loading ? <Loader2 className="animate-spin" /> : "Finalizar Venda"}
            </Button>
        </div>
      </Card>
           
    </div>
  )
}
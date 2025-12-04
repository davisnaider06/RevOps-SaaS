'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Trash2, Loader2, Minus, Plus } from "lucide-react"

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
        body: JSON.stringify({ items: itemsPayload })
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
        <div className="p-4 bg-slate-50 border-t">
            <div className="flex justify-between items-center mb-4">
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
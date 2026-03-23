'use client'

import { useEffect, useState } from "react"
import { CreateProductDialog } from "@/components/create-product-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Scissors, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImportProductsDialog } from "@/components/import-products-dialog"

interface Product {
  id: string
  name: string
  price: number
  type: 'GOOD' | 'SERVICE'
  stockQuantity: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  function loadProducts() {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    fetch(`${apiUrl}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setProducts(data)
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleDelete(id: string) {
    if(!confirm("Apagar este item?")) return
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
    
    await fetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    loadProducts()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Catálogo & Estoque</h1>
          <p className="text-slate-500">Gerencie seus produtos e serviços.</p>
        </div>
        <ImportProductsDialog onSuccess={loadProducts} />
        <CreateProductDialog onSuccess={loadProducts} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens Cadastrados ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-4 text-slate-500">Carregando...</div>
          ) : products.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              Nenhum item. Cadastre seus serviços ou produtos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline" className={item.type === 'SERVICE' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                            {item.type === 'SERVICE' ? <Scissors className="mr-1 h-3 w-3" /> : <Package className="mr-1 h-3 w-3" />}
                            {item.type === 'SERVICE' ? 'Serviço' : 'Produto'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.price))}
                      </TableCell>
                      <TableCell>
                        {item.type === 'SERVICE' ? (
                            <span className="text-slate-400 text-xs italic">Infinito</span>
                        ) : (
                            <span className={`font-bold ${item.stockQuantity === 0 ? "text-red-500" : "text-slate-700"}`}>
                                {item.stockQuantity} un.
                            </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
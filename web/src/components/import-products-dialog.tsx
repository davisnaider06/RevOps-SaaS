'use client'

import { useState } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, FileSpreadsheet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ImportProductsDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    Papa.parse(file, {
      header: true, // Usa a primeira linha como cabeçalho
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data.map((row: any) => ({
          name: row.Nome || row.name || row.Produto, // Tenta adivinhar o nome da coluna
          price: Number(row.Preco || row.price || row.Valor || 0),
          stockQuantity: Number(row.Estoque || row.stock || row.Quantidade || 0),
          type: 'GOOD'
        }))

        // Filtra linhas vazias ou sem nome
        const validData = data.filter((d: any) => d.name && d.price > 0)

        if (validData.length === 0) {
            alert("Nenhum produto válido encontrado. Verifique se o CSV tem colunas: Nome, Preco, Estoque")
            setLoading(false)
            return
        }

        await sendToBackend(validData)
      }
    })
  }

  async function sendToBackend(products: any[]) {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      const res = await fetch(`${apiUrl}/products/batch`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(products)
      })

      if (res.ok) {
        alert(`${products.length} produtos importados com sucesso!`)
        setOpen(false)
        onSuccess()
      } else {
        alert("Erro ao salvar no banco.")
      }
    } catch (error) {
      alert("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" /> 
          Importar Excel/CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Estoque</DialogTitle>
          <DialogDescription>
            Envie um arquivo <b>.csv</b> com as colunas: <b>Nome, Preco, Estoque</b>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-10 gap-4 mt-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            {loading ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <span>Processando planilha...</span>
                </div>
            ) : (
                <>
                    <Upload className="h-10 w-10 text-slate-400" />
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">Clique para selecionar o arquivo</p>
                        <p className="text-xs text-slate-500 mt-1">Apenas arquivos .csv</p>
                    </div>
                    {/* Input invisível cobrindo a área */}
                    <input 
                        type="file" 
                        accept=".csv"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                    />
                </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
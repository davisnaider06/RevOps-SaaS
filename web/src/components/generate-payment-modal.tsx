'use client'

import { useState } from "react"
import { DollarSign, Copy, Loader2, Link as LinkIcon, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Props para receber dados do Lead automaticamente
interface GeneratePaymentModalProps {
    leadName?: string
    leadPhone?: string | any// Formato 5511999999999
    defaultAmount?: number
}

export function GeneratePaymentModal({ leadName, leadPhone, defaultAmount }: GeneratePaymentModalProps) {
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "")
  const [title, setTitle] = useState(leadName ? `Serviço para ${leadName}` : "")
  const [provider, setProvider] = useState("MERCADO_PAGO")
  const [generatedLink, setGeneratedLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setGeneratedLink("")
    const token = localStorage.getItem('revops-token')

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/link`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                provider,
                amount: parseFloat(amount.replace(',', '.')), // Garante formato decimal
                title
            })
        })

        const data = await res.json()

        if (!res.ok) {
            alert(data.message || "Erro ao gerar")
            return
        }

        setGeneratedLink(data.url)

    } catch (error) {
        console.error(error)
        alert("Erro de conexão")
    } finally {
        setLoading(false)
    }
  }

  // Função para abrir o WhatsApp Web/App
  function handleSendWhatsApp() {
    if (!generatedLink) return
    
    // Texto da mensagem
    const text = `Olá ${leadName || ''}, segue o link para pagamento: ${generatedLink}`
    const encodedText = encodeURIComponent(text)
    
    // Se tiver telefone, manda direto pro numero, senao abre pra escolher
    const url = leadPhone 
        ? `https://wa.me/${leadPhone}?text=${encodedText}`
        : `https://wa.me/?text=${encodedText}`
        
    window.open(url, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* Botão menor e discreto para caber no Card */}
        <Button variant="outline" size="sm" className="h-8 gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            <DollarSign className="w-3 h-3" /> Cobrar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Gerar Link de Pagamento</DialogTitle>
        </DialogHeader>

        {!generatedLink ? (
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Plataforma</Label>
                    <Select value={provider} onValueChange={setProvider}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MERCADO_PAGO">Mercado Pago</SelectItem>
                            <SelectItem value="KIWIFY">Kiwify</SelectItem>
                            <SelectItem value="CAKTO">Cakto</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input 
                        placeholder="Ex: Consultoria" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                    />
                </div>

                <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                    />
                </div>

                <Button 
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700" 
                    onClick={handleGenerate} 
                    disabled={loading || !amount || !title}
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Gerar Link"}
                </Button>
            </div>
        ) : (
            <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <LinkIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800">Pronto!</h3>
                
                {/* Campo do Link */}
                <div className="flex gap-2 mt-4">
                    <Input value={generatedLink} readOnly className="bg-slate-50 text-xs" />
                    <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(generatedLink)}>
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
                
                {/* BOTÃO MÁGICO DO WHATSAPP */}
                <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-white gap-2 mt-2"
                    onClick={handleSendWhatsApp}
                >
                    <Send className="w-4 h-4" /> Enviar no WhatsApp
                </Button>
                
                <div className="pt-2">
                    <Button variant="ghost" className="text-xs text-slate-400" onClick={() => setGeneratedLink("")}>
                        Novo Link
                    </Button>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
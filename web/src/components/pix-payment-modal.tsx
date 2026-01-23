'use client'

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Copy, DollarSign, Send, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generatePixPayload } from "@/lib/pix-generator"

interface PixPaymentModalProps {
    defaultAmount?: number
    leadName?: string
    leadPhone?: string
    children?: React.ReactNode // <--- Importante para aceitar o botão do PDV
}

export function PixPaymentModal({ defaultAmount, leadName, leadPhone, children }: PixPaymentModalProps) {
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "")
  const [pixCode, setPixCode] = useState("")
  const [userConfig, setUserConfig] = useState<any>(null)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [isOpen, setIsOpen] = useState(false) // Controle manual do modal

  // Atualiza o valor se o defaultAmount mudar (ex: carrinho do PDV mudou)
  useEffect(() => {
    if (defaultAmount) {
        setAmount(String(defaultAmount))
    }
  }, [defaultAmount])

  // Busca dados do usuário ao abrir
  useEffect(() => {
    if (isOpen) {
        const token = localStorage.getItem('revops-token')
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.pixKey) setUserConfig(data)
        })
        .finally(() => setLoadingConfig(false))
    }
  }, [isOpen])
  
  function handleGenerate() {
    if(!amount || !userConfig) return

    const payload = generatePixPayload({
        key: userConfig.pixKey,
        name: userConfig.pixName || 'RECEBEDOR',
        city: userConfig.pixCity || 'BRASIL',
        amount: parseFloat(amount.replace(',', '.')),
        txid: "PDV" + Math.floor(Math.random() * 1000)
    })

    setPixCode(payload)
  }

  function handleCopy() {
    navigator.clipboard.writeText(pixCode)
    alert("Código Pix copiado!")
  }

  function handleSendWhatsApp() {
    const text = `Olá ${leadName || 'cliente'}, segue o código Pix para pagamento de R$ ${amount}. \n\nCopie e cole no app do seu banco:\n\n${pixCode}`
    const url = leadPhone 
        ? `https://wa.me/${leadPhone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* LÓGICA DO GATILHO: */}
        {children ? (
            // Se passar um botão do PDV, usa ele (e repassa os eventos de clique)
            children
        ) : (
            // Se não passar nada (CRM), usa o botão padrão
            <Button size="sm" variant="outline" className="h-7 gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50 px-2">
                <DollarSign className="w-3 h-3" /> Pix
            </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Pix de Cobrança</DialogTitle>
        </DialogHeader>

        {loadingConfig ? (
            <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
        ) : !userConfig ? (
            <div className="text-center py-6 space-y-4">
                <AlertCircle className="w-10 h-10 text-orange-500 mx-auto" />
                <p className="text-sm text-slate-600">Você ainda não configurou sua chave Pix.</p>
                <Button variant="default" onClick={() => window.location.href='/settings/pix'}>
                    Configurar Agora
                </Button>
            </div>
        ) : !pixCode ? (
            <div className="space-y-4 py-4">
                <div className="p-3 bg-slate-50 text-slate-600 text-xs rounded border">
                    Recebedor: <strong>{userConfig.pixName}</strong> <br/>
                    Chave: {userConfig.pixKey}
                </div>

                <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="0.00" 
                    />
                </div>

                <Button onClick={handleGenerate} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Gerar QR Code
                </Button>
            </div>
        ) : (
            <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                    <QRCodeSVG value={pixCode} size={180} />
                </div>
                
                <p className="text-sm font-bold text-slate-700">R$ {amount}</p>

                <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1 gap-2 text-xs" onClick={handleCopy}>
                        <Copy className="w-3 h-3" /> Copia e Cola
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2 text-xs text-white" onClick={handleSendWhatsApp}>
                        <Send className="w-3 h-3" /> Enviar Zap
                    </Button>
                </div>
                
                <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setPixCode("")}>
                    Voltar
                </Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
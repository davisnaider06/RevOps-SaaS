'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Share2, Copy, Check, Loader2 } from "lucide-react"

interface Props {
  projectId: string
  currentShareToken?: string | null
}

export function ShareProjectDialog({ projectId, currentShareToken }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Se já tiver token, monta a URL. Se não, fica vazio.
  const [link, setLink] = useState(
    currentShareToken 
      ? `${window.location.origin}/portal/${currentShareToken}` 
      : ""
  )

  async function handleGenerate() {
    setLoading(true)
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      const res = await fetch(`${apiUrl}/projects/${projectId}/share`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await res.json()

      if (!data.shareToken) {
        console.error("Erro no backend:", data)
        throw new Error("O servidor não retornou um token válido.")
      }
      
      // Monta o link completo usando a origem atual (localhost ou vercel)
      const fullLink = `${window.location.origin}/portal/${data.shareToken}`
      setLink(fullLink)

    } catch (err) {
      alert("Erro ao gerar link.")
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // Volta o ícone depois de 2s
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" /> 
          Compartilhar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Portal do Cliente</DialogTitle>
          <DialogDescription>
            Qualquer pessoa com este link poderá ver o progresso e os custos deste projeto (apenas leitura).
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">Link</Label>
            <Input 
              id="link" 
              value={link} 
              readOnly 
              placeholder="Clique em gerar para criar um link..."
              className="bg-slate-50"
            />
          </div>
          
          {/* Botão de Copiar (Só aparece se tiver link) */}
          {link && (
            <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (link ? "Gerar Novo Link" : "Gerar Link")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
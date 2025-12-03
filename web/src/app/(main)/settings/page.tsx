'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, User, Building } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Estados do formulário
  const [name, setName] = useState("")
  const [email, setEmail] = useState("") // Apenas leitura
  const [companyName, setCompanyName] = useState("")
  const [document, setDocument] = useState("")

  useEffect(() => {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    // Busca os dados atuais
    fetch(`${apiUrl}/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setName(data.name)
      setEmail(data.email)
      setCompanyName(data.companyName)
      setDocument(data.document || "")
    })
    .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      const response = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, companyName, document }),
      })

      if (response.ok) {
        alert("Configurações salvas com sucesso!")
        window.location.reload() // Recarrega para garantir que nomes atualizem no sistema
      } else {
        throw new Error()
      }
    } catch (err) {
      alert("Erro ao salvar.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-slate-500">Carregando configurações...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Gerencie seus dados pessoais e da sua empresa.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Perfil & Empresa</CardTitle>
            <CardDescription>
              Essas informações serão usadas nos seus relatórios e faturas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Dados Pessoais */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Seu Nome</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>E-mail (Não alterável)</Label>
              <Input value={email} disabled className="bg-slate-100" />
            </div>

            <div className="border-t pt-4 mt-4"></div>

            {/* Dados da Empresa */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Building className="h-4 w-4" /> Nome da Empresa</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>CNPJ / Documento (Opcional)</Label>
              <Input 
                value={document} 
                onChange={e => setDocument(e.target.value)} 
                placeholder="00.000.000/0001-00"
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end border-t p-6">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
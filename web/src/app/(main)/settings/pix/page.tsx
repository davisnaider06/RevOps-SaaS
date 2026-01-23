'use client'

import { useEffect, useState } from "react"
import { Save, QrCode, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PixSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pixKey: '',
    pixName: '',
    pixCity: ''
  })

  // Carrega dados atuais
  useEffect(() => {
    const token = localStorage.getItem('revops-token')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if(data) {
            setFormData({
                pixKey: data.pixKey || '',
                pixName: data.pixName || '',
                pixCity: data.pixCity || ''
            })
        }
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('revops-token')

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/pix`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            alert("Dados do Pix salvos com sucesso!") // <--- Usamos alert simples
        } else {
            alert("Erro ao salvar.")
        }
    } catch (error) {
        console.error(error)
        alert("Erro de conexão.")
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings">
            <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
            </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Configuração Pix</h1>
            <p className="text-slate-500">Defina a conta onde você receberá os pagamentos.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded text-emerald-600">
                    <QrCode className="w-5 h-5" />
                </div>
                <div>
                    <CardTitle>Dados do Beneficiário</CardTitle>
                    <CardDescription>Esses dados aparecerão no comprovante do seu cliente.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                    <Label>Chave Pix (CPF, Email, Aleatória...)</Label>
                    <Input 
                        placeholder="Ex: seu-email@gmail.com" 
                        value={formData.pixKey}
                        onChange={e => setFormData({...formData, pixKey: e.target.value})}
                        required
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nome Completo (Titular da Conta)</Label>
                        <Input 
                            placeholder="JOAO DA SILVA" 
                            value={formData.pixName}
                            onChange={e => setFormData({...formData, pixName: e.target.value})}
                            required
                        />
                        <p className="text-xs text-slate-400">Sem acentos, igual no banco.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Cidade do Banco</Label>
                        <Input 
                            placeholder="SAO PAULO" 
                            value={formData.pixCity}
                            onChange={e => setFormData({...formData, pixCity: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Configuração'} <Save className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

    try {
      await fetch(`${apiUrl}/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Sempre dizemos que enviou (segurança)
      setSent(true)
    } catch (err) {
      alert("Erro ao conectar com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu e-mail e enviaremos um link para você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-md text-sm">
                Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link em instantes.
                <br/>
                <span className="text-xs text-slate-500">(Como é ambiente dev, olhe o terminal do backend!)</span>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Voltar para Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Link'}
              </Button>
            </form>
          )}
        </CardContent>
        {!sent && (
          <CardFooter className="justify-center">
            <Link href="/login" className="flex items-center text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
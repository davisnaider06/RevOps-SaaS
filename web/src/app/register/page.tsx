'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, Briefcase, ShoppingBag } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [orgType, setOrgType] = useState<'SERVICE' | 'RETAIL'>('SERVICE')

  // Campos do formulário
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    
    if (!isValidEmail(email)) {
      setError("Por favor, digite um e-mail válido.")
      return
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
      return
    }

    setLoading(true)
    setError('')

    try {
      // Usa a variável de ambiente se existir, senão usa localhost
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          companyName,
          orgType
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta')
      }

      alert('Conta criada com sucesso! Faça login.')
      router.push('/login')

    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Crie sua Conta</CardTitle>
          <CardDescription className="text-center">
            Comece a gerenciar sua empresa hoje mesmo.
          </CardDescription>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
            onClick={() => setOrgType('SERVICE')}
            className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${orgType === 'SERVICE' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
        >
            <Briefcase className={orgType === 'SERVICE' ? "text-blue-600" : "text-slate-400"} />
            <span className={`text-sm font-bold ${orgType === 'SERVICE' ? "text-blue-700" : "text-slate-500"}`}>Serviços</span>
            <span className="text-[10px] text-center text-slate-400 leading-tight">Para agências, consultores e projetos.</span>
        </div>

        <div 
            onClick={() => setOrgType('RETAIL')}
            className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${orgType === 'RETAIL' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
        >
            <ShoppingBag className={orgType === 'RETAIL' ? "text-emerald-600" : "text-slate-400"} />
            <span className={`text-sm font-bold ${orgType === 'RETAIL' ? "text-emerald-700" : "text-slate-500"}`}>Comércio</span>
            <span className="text-[10px] text-center text-slate-400 leading-tight">Para lojas, barbearias e vendas rápidas.</span>
        </div>
    </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu Nome</Label>
              <Input 
                id="name" 
                placeholder="Ex: Davi Silva" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Nome da Empresa</Label>
              <Input 
                id="company" 
                placeholder="Ex: Minha Agência" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta Grátis'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-500">
            Já tem conta? <Link href="/login" className="text-blue-600 hover:underline">Faça Login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
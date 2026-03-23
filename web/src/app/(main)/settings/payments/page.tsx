'use client'

import { useEffect, useState } from "react"
import { CreditCard, Trash2, CheckCircle2, Wallet, Link as LinkIcon, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
//import { useToast } from "@/components/ui/use-toast"

// Definição do que cada Gateway precisa
const GATEWAYS = [
    {
        id: 'MERCADO_PAGO',
        name: 'Mercado Pago',
        description: 'Receba via Pix e Cartão (Split disponível).',
        icon: Wallet,
        color: 'bg-blue-500',
        tutorialUrl: 'https://www.mercadopago.com.br/developers/panel/app',
        tutorialText: 'Crie uma aplicação, vá em "Credenciais de Produção" e copie o Access Token.',
        fields: [
            { 
                key: 'accessToken', 
                label: 'Access Token (Produção)', 
                type: 'password', 
                placeholder: 'APP_USR-00000000-0000...',
                help: 'Obrigatório iniciar com APP_USR-' 
            },
            { 
                key: 'publicKey', 
                label: 'Public Key', 
                type: 'text', 
                placeholder: 'APP_USR-...' 
            }
        ]
    },
    {
        id: 'KIWIFY',
        name: 'Kiwify',
        description: 'Plataforma para infoprodutos.',
        icon: CreditCard,
        color: 'bg-green-500',
        tutorialUrl: 'https://dashboard.kiwify.com.br/integrations/token',
        tutorialText: 'Acesse o menu Integrações > API para copiar seu Token.',
        fields: [
            { 
                key: 'apiToken', 
                label: 'Token da API', 
                type: 'password', 
                placeholder: 'Cole seu token aqui' 
            }
        ]
    },
    {
        id: 'CAKTO',
        name: 'Cakto',
        description: 'Checkout de alta conversão.',
        icon: LinkIcon, // Use o import { Link as LinkIcon } from "lucide-react"
        color: 'bg-purple-500',
        tutorialUrl: 'https://app.cakto.com.br/configuracoes/api', // URL padrão do painel
        tutorialText: 'No painel da Cakto, vá em Configurações > API e gere um novo token.',
        fields: [
            { 
                key: 'licenseKey', 
                label: 'Chave de Licença / Token', 
                type: 'password', 
                placeholder: 'Cole a chave da Cakto aqui' 
            }
        ]
    },
    {
        id: 'UTMIFY',
        name: 'Utmify',
        description: 'Rastreamento de vendas e pixels.',
        icon: Lock,
        color: 'bg-orange-500',
        tutorialUrl: 'https://app.utmify.com.br/integrations/webhooks',
        tutorialText: 'Vá em Integrações > Webhooks > Credenciais API e crie uma nova.',
        fields: [
            { 
                key: 'token', 
                label: 'Token de API (x-api-token)', 
                type: 'password',
                placeholder: 'Cole o token gerado na Utmify' 
            }
        ]
    },
    {
        id: 'INTER',
        name: 'Banco Inter',
        description: 'Emissão de boletos e Pix PJ.',
        icon: Wallet,
        color: 'bg-orange-400',
        tutorialUrl: 'https://internetbanking.bancointer.com.br/',
        tutorialText: 'No IB PJ: Soluções > Nova Aplicação. Baixe o PDF com as chaves e certificado.',
        fields: [
            { 
                key: 'clientId', 
                label: 'Client ID', 
                type: 'text',
                placeholder: 'Cole o Client ID' 
            },
            { 
                key: 'clientSecret', 
                label: 'Client Secret', 
                type: 'password',
                placeholder: 'Cole o Client Secret' 
            },
            // O Inter exige certificado. Para simplificar o texto, pedimos o conteúdo:
            { 
                key: 'certificateCrt', 
                label: 'Conteúdo do Certificado (.crt)', 
                type: 'text',
                placeholder: '-----BEGIN CERTIFICATE----- ...',
                help: 'Abra o arquivo .crt no bloco de notas e cole tudo aqui.'
            },
            { 
                key: 'certificateKey', 
                label: 'Conteúdo da Chave (.key)', 
                type: 'password',
                placeholder: '-----BEGIN PRIVATE KEY----- ...',
                help: 'Abra o arquivo .key no bloco de notas e cole tudo aqui.'
            }
        ]
    }
]

export default function PaymentSettingsPage() {
    const [integrations, setIntegrations] = useState<any[]>([])
    const [selectedGateway, setSelectedGateway] = useState<any>(null) // Qual modal está aberto
    const [formData, setFormData] = useState<any>({})
    const [loading, setLoading] = useState(false)

    // Carregar integrações salvas
    async function loadIntegrations() {
        const token = localStorage.getItem('revops-token')
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            // Tenta ler o JSON
            const data = await res.json()
            if (Array.isArray(data)) {
                setIntegrations(data)
            } else {
                console.error("API não retornou uma lista:", data)
                setIntegrations([]) // Garante lista vazia para não quebrar a tela
            }
        } catch (error) {
            console.error("Erro ao carregar:", error)
            setIntegrations([]) 
        }
    }

    useEffect(() => { loadIntegrations() }, [])

    // Abrir Modal
    function handleOpenModal(gateway: any) {
        // Se já existe configurado, preenche os dados (exceto senhas por segurança se quiser limpar)
        const existing = integrations.find(i => i.provider === gateway.id)
        if (existing) {
            setFormData(existing.credentials)
        } else {
            setFormData({})
        }
        setSelectedGateway(gateway)
    }

    // Salvar
    async function handleSave() {
        setLoading(true)
        const token = localStorage.getItem('revops-token')

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    provider: selectedGateway.id,
                    name: selectedGateway.name,
                    credentials: formData
                })
            })
            
            await loadIntegrations()
            setSelectedGateway(null) // Fecha modal
        } catch (error) {
            console.error(error)
            alert("Erro ao salvar integração")
        } finally {
            setLoading(false)
        }
    }

    // Remover
    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        if(!confirm("Tem certeza que deseja desconectar?")) return

        const token = localStorage.getItem('revops-token')
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        loadIntegrations()
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Gateways de Pagamento</h1>
                <p className="text-slate-500">Conecte suas contas para receber diretamente dos seus clientes.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GATEWAYS.map((gw) => {
                    const isConnected = integrations.find(i => i.provider === gw.id)
                    const Icon = gw.icon

                    return (
                        <Card 
                            key={gw.id} 
                            className={`cursor-pointer transition-all hover:border-slate-400 ${isConnected ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : ''}`}
                            onClick={() => handleOpenModal(gw)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-semibold">{gw.name}</CardTitle>
                                <div className={`p-2 rounded-full text-white ${isConnected ? 'bg-emerald-500' : 'bg-slate-200 text-slate-400'}`}>
                                    {isConnected ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5 text-slate-500" />}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="min-h-[40px] mt-2">
                                    {gw.description}
                                </CardDescription>
                                
                                {isConnected && (
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ativo
                                        </span>
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 h-8 px-2" onClick={(e) => handleDelete(isConnected.id, e)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                                
                                {!isConnected && (
                                    <Button variant="outline" className="w-full mt-4 border-dashed border-slate-300">
                                        Conectar
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* MODAL DINÂMICO DE CONFIGURAÇÃO */}
            <Dialog open={!!selectedGateway} onOpenChange={() => setSelectedGateway(null)}>
                <DialogContent className="max-w-lg">
    <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
            Configurar {selectedGateway?.name}
        </DialogTitle>
        <DialogDescription>
            Para conectar, você precisa buscar sua chave de acesso.
        </DialogDescription>
    </DialogHeader>

    {/* ÁREA DE AJUDA COM DESTAQUE */}
    {selectedGateway?.tutorialUrl && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-md text-sm text-blue-800 flex flex-col gap-2">
            <p className="font-semibold flex items-center gap-2">
                <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">?</span>
                Como conseguir a chave:
            </p>
            <p>{selectedGateway.tutorialText}</p>
            <a 
                href={selectedGateway.tutorialUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 underline hover:text-blue-800 font-bold flex items-center gap-1"
            >
                Clique aqui para abrir o painel do {selectedGateway.name}
                <ArrowRight className="w-3 h-3" />
            </a>
        </div>
    )}

    <div className="space-y-4 py-4">
        {selectedGateway?.fields.map((field: any) => (
            <div key={field.key} className="space-y-2">
                <Label className="flex justify-between">
                    {field.label}
                    {field.help && <span className="text-xs text-slate-400 font-normal">{field.help}</span>}
                </Label>
                <div className="relative">
                    <Input 
                        type={field.type} 
                        placeholder={field.placeholder}
                        defaultValue={field.readOnly ? field.value : formData[field.key] || ''}
                        readOnly={field.readOnly}
                        onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                        className="pr-10"
                    />
                    {/* Ícone de cadeado visual */}
                    {field.type === 'password' && (
                         <div className="absolute right-3 top-2.5 text-slate-400">
                            <Lock className="w-4 h-4" />
                         </div>
                    )}
                </div>
            </div>
        ))}
    </div>

    <DialogFooter>
        <Button variant="outline" onClick={() => setSelectedGateway(null)}>Cancelar</Button>
        <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Salvando...' : 'Salvar Conexão'}
        </Button>
    </DialogFooter>
</DialogContent>
            </Dialog>
        </div>
    )
}
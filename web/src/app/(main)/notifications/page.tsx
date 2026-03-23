'use client'

import { useEffect, useState } from "react"
import { Bell, Check, Rocket, DollarSign, Settings } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])

  async function loadNotifications() {
    const token = localStorage.getItem('revops-token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setNotifications(data)
  }

  async function markAsRead(id: string) {
    const token = localStorage.getItem('revops-token')
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    // Atualiza localmente para sumir o botão
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  async function markAllAsReadOnLoad() {
    const token = localStorage.getItem('revops-token')
    
    // Chama o backend para limpar o banco
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  useEffect(() => {
    loadNotifications()
    markAllAsReadOnLoad()
  }, [])
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bell className="text-blue-600" /> Notificações
      </h1>

      <div className="space-y-3">
        {notifications.length === 0 && <p className="text-slate-500">Nenhuma notificação.</p>}
        
        {notifications.map((notif) => (
          <Card key={notif.id} className={`p-4 flex gap-4 ${notif.isRead ? 'opacity-60 bg-slate-50' : 'bg-white border-blue-200'}`}>
            <div className="p-2 bg-slate-100 rounded-full h-fit">
               {/* Ícone simples baseado no titulo */}
               {notif.title.includes('Venda') ? <DollarSign className="w-5 h-5 text-emerald-600"/> : <Rocket className="w-5 h-5 text-blue-600"/>}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">{notif.title}</h3>
              <p className="text-sm text-slate-600">{notif.message}</p>
              <span className="text-xs text-slate-400 mt-1 block">
                {new Date(notif.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {!notif.isRead && (
              <Button size="icon" variant="ghost" onClick={() => markAsRead(notif.id)}>
                <Check className="w-4 h-4 text-blue-600" />
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
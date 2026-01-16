'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  // Função que busca a contagem
  async function checkNotifications() {
    const token = localStorage.getItem('revops-token')
    if (!token) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (Array.isArray(data)) {
        // Conta quantas não estão lidas
        const count = data.filter((n: any) => !n.isRead).length
        setUnreadCount(count)
      }
    } catch (error) {
      console.error("Erro silencioso ao checar notificações")
    }
  }

  useEffect(() => {
    // 1. Checa assim que carrega
    checkNotifications()

    // 2. Configura um "ping" a cada 30 segundos (Polling)
    const interval = setInterval(checkNotifications, 3 * 1000)

    // Limpa quando o componente desmonta
    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/notifications" className="relative group p-2 rounded-full hover:bg-slate-100 transition-colors">
      <Bell className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
      
      {/* A Bolinha Vermelha (Badge) */}
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] font-bold text-white items-center justify-center">
            {/* Se quiser mostrar o número, descomente abaixo. Se quiser só a bolinha, deixe vazio. */}
            {/* {unreadCount > 9 ? '+9' : unreadCount} */}
          </span>
        </span>
      )}
    </Link>
  )
}
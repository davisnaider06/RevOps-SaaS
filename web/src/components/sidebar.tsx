'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Wallet, 
  Settings, 
  LogOut, 
  Menu,
  Kanban,
  Package,
  ShoppingCart,
  Calendar
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState, useEffect } from "react"

// Definição das Rotas com Escopo (Quem pode ver)
const routes = [
  {
    label: "Visão Geral",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
    scopes: ['SERVICE', 'RETAIL'] // Todo mundo vê
  },
  {
    label: "PDV / Caixa",
    icon: ShoppingCart,
    href: "/pos",
    color: "text-orange-600",
    scopes: ['RETAIL'] // Só Varejo
  },
  {
    label: "Catálogo / Estoque",
    icon: Package,
    href: "/products",
    color: "text-pink-500",
    scopes: ['RETAIL'] // Só Varejo
  },
  {
    label: "CRM / Pipeline",
    icon: Kanban,
    href: "/crm",
    color: "text-orange-500",
    scopes: ['SERVICE'] // Só Serviços
  },
  {
    label: "Projetos",
    icon: FolderKanban,
    href: "/projects",
    color: "text-violet-500",
    scopes: ['SERVICE'] // Só Serviços
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clients",
    color: "text-pink-700",
    scopes: ['SERVICE', 'RETAIL'] // Todo mundo vê
  },
  {
    label: "Financeiro",
    icon: Wallet,
    href: "/finance",
    color: "text-emerald-500",
    scopes: ['SERVICE', 'RETAIL'] // Todo mundo vê
  },

  {
    label: "Financeiro",
    icon: Wallet,
    href: "/finance",
    color: "text-emerald-500",
    scopes: ['SERVICE', 'RETAIL'] // Todo mundo vê
  },

  {
    label: "Agenda",
    icon: Calendar,
    href: "/agenda",
    color: "text-gray-500", 
    scopes: ['SERVICE']
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)

  // Ao carregar, descobre quem é o usuário
  useEffect(() => {
    // Pega do localStorage (salvo no login) ou define padrão SERVICE
    const type = localStorage.getItem('revops-org-type') || 'SERVICE'
    setUserType(type)
  }, [])

  function handleLogout() {
    localStorage.removeItem('revops-token')
    localStorage.removeItem('revops-org-type') // Limpa o tipo também
    window.location.href = '/login'
  }

  //Filtra as rotas baseadas no tipo
  const filteredRoutes = routes.filter(route => 
    userType ? route.scopes.includes(userType) : false
  )

  return (
    <>
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50 bg-slate-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            RevOps <span className="text-emerald-400">SaaS</span>
          </h1>
          {userType && (
            <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-800 px-2 py-1 rounded mt-2 inline-block">
                Modo: {userType === 'SERVICE' ? 'Serviços' : 'Varejo'}
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-1 px-3">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
        <div className="p-4 mt-auto">
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-3" />
                Sair
            </Button>
        </div>
      </div>

      {/* Sidebar Mobile */}
      <div className="md:hidden flex items-center p-4 border-b bg-white">
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-slate-900 text-white border-r-slate-800 p-0">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white">RevOps</h1>
                </div>
                <div className="flex flex-col gap-1 px-3">
                    {filteredRoutes.map((route) => (
                        <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                            "text-sm group flex p-3 w-full justify-start font-medium hover:text-white hover:bg-white/10 rounded-lg transition",
                            pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                        )}
                        >
                        <div className="flex items-center flex-1">
                            <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                            {route.label}
                        </div>
                        </Link>
                    ))}
                     <div className="mt-8">
                        <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                            <LogOut className="h-5 w-5 mr-3" /> Sair
                        </Button>
                     </div>
                </div>
            </SheetContent>
        </Sheet>
        <h1 className="ml-4 font-bold text-lg">RevOps</h1>
      </div>
    </>
  )
}
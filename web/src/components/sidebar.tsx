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
  Menu 
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

const routes = [
  {
    label: "Visão Geral",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Projetos",
    icon: FolderKanban,
    href: "/projects",
    color: "text-violet-500",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clients",
    color: "text-pink-700",
  },
  {
    label: "Financeiro",
    icon: Wallet,
    href: "/finance",
    color: "text-emerald-500",
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500", // Futuro
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Função para deslogar
  function handleLogout() {
    localStorage.removeItem('revops-token')
    window.location.href = '/login'
  }

  return (
    <>
      {/* --- Sidebar Desktop (Fixo) --- */}
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50 bg-slate-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            RevOps <span className="text-emerald-400">SaaS</span>
          </h1>
        </div>
        <div className="flex-1 flex flex-col gap-1 px-3">
          {routes.map((route) => (
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

      {/* --- Sidebar Mobile (Sheet) --- */}
      <div className="md:hidden flex items-center p-4 border-b bg-white">
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-slate-900 text-white border-r-slate-800 p-0">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white">RevOps</h1>
                </div>
                <div className="flex flex-col gap-1 px-3">
                    {routes.map((route) => (
                        <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setOpen(false)} // Fecha ao clicar
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
                            <LogOut className="h-5 w-5 mr-3" />
                            Sair
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
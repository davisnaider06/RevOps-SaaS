'use client'

import { useEffect, useState } from "react"
import { Calendar, Plus, Circle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function AgendaPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")

  async function loadTasks() {
    const token = localStorage.getItem('revops-token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if(Array.isArray(data)) setTasks(data)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle) return

    const token = localStorage.getItem('revops-token')
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
            title: newTaskTitle, 
            date: new Date().toISOString() // Cria para hoje por padrão
        })
    })
    setNewTaskTitle("")
    loadTasks()
  }

  async function toggleTask(id: string, currentStatus: boolean) {
    // Optimistic Update (muda na tela antes do backend)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t))

    const token = localStorage.getItem('revops-token')
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isCompleted: !currentStatus })
    })
  }

  useEffect(() => { loadTasks() }, [])

  // Agrupando visualmente
  const todo = tasks.filter(t => !t.isCompleted)
  const done = tasks.filter(t => t.isCompleted)

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
       <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Calendar className="text-emerald-600" /> Agenda
            </h1>
       </div>

       {/* Área de Criação Rápida */}
       <Card className="p-4 bg-slate-50 border-dashed">
            <form onSubmit={handleCreate} className="flex gap-2">
                <Input 
                    placeholder="O que você precisa fazer hoje?" 
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="bg-white"
                />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
            </form>
       </Card>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* A Fazer */}
            <div className="space-y-3">
                <h2 className="font-semibold text-slate-700">A Fazer ({todo.length})</h2>
                {todo.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-white border rounded shadow-sm hover:border-emerald-300 transition-colors group">
                        <button onClick={() => toggleTask(task.id, false)} className="text-slate-300 hover:text-emerald-500">
                            <Circle className="w-6 h-6" />
                        </button>
                        <span className="text-slate-800 font-medium">{task.title}</span>
                    </div>
                ))}
            </div>

            {/* Concluídos */}
            <div className="space-y-3 opacity-60">
                <h2 className="font-semibold text-slate-500">Concluídas Recentemente</h2>
                {done.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 border rounded">
                        <button onClick={() => toggleTask(task.id, true)} className="text-emerald-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </button>
                        <span className="text-slate-500 line-through">{task.title}</span>
                    </div>
                ))}
            </div>
       </div>
    </div>
  )
}
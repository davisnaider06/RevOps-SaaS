'use client'

import { useEffect, useState } from "react"
import { CreateClientDialog } from "@/components/create-client-dialog"
import { EditClientDialog } from "@/components/edit-client-dialog" 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input" // <--- Novo
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, FolderKanban, Search, Trash2 } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  _count: { projects: number }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([]) // Para a busca
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Função para carregar dados
  function loadClients() {
    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    fetch(`${apiUrl}/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setClients(data)
        setFilteredClients(data) // Inicia lista filtrada com tudo
      }
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadClients()
  }, [])

  // Filtro local
  useEffect(() => {
    const lowerSearch = search.toLowerCase()
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(lowerSearch) ||
      client.email?.toLowerCase().includes(lowerSearch)
    )
    setFilteredClients(filtered)
  }, [search, clients])

  // Função de Deletar
  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    const token = localStorage.getItem('revops-token')
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

    try {
      const res = await fetch(`${apiUrl}/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        alert("Cliente excluído.")
        loadClients()
      } else {
        alert("Não é possível excluir clientes que possuem projetos ativos.")
      }
    } catch (error) {
      alert("Erro ao excluir.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-500">Gerencie sua carteira de parceiros.</p>
        </div>
        <CreateClientDialog />
      </div>

      <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border w-full sm:w-96">
        <Search className="h-4 w-4 text-slate-500 ml-2" />
        <Input 
          placeholder="Buscar por nome ou email..." 
          className="border-none focus-visible:ring-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Sua Carteira ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-4 text-slate-500">Carregando...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center p-8 text-slate-500">
              Nenhum cliente encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Projetos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {client.email && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Mail className="mr-2 h-3 w-3" /> {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Phone className="mr-2 h-3 w-3" /> {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                            <FolderKanban className="h-3 w-3" />
                            {client._count.projects}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right flex justify-end gap-1">
                        <EditClientDialog client={client} onSuccess={loadClients} />
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
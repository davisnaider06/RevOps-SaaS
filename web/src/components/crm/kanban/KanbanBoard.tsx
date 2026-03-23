'use client'

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard, Lead } from "./KanbanCard";

// Suas colunas originais
const COLUMNS = [
  { id: 'NEW', title: 'Novos', color: 'bg-blue-500' },
  { id: 'CONTACT', title: 'Em Contato', color: 'bg-yellow-500' },
  { id: 'PROPOSAL', title: 'Proposta', color: 'bg-purple-500' },
  { id: 'WON', title: 'Ganho', color: 'bg-emerald-500' },
  { id: 'LOST', title: 'Perdido', color: 'bg-red-500' },
];

interface KanbanBoardProps {
  initialLeads: Lead[];
}

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Atualiza o estado local se a prop mudar (ex: recarregamento da página pai)
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const lead = leads.find((l) => l.id === active.id);
    if (lead) setActiveLead(lead);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === "Lead";
    if (!isActiveALead) return;

    setLeads((items) => {
      const activeIndex = items.findIndex((i) => i.id === activeId);
      const overIndex = items.findIndex((i) => i.id === overId);

      // Movendo entre colunas diferentes visualmente
      if (items[activeIndex].status !== items[overIndex]?.status && overIndex !== -1) {
        items[activeIndex].status = items[overIndex].status;
        return arrayMove(items, activeIndex, overIndex);
      }

      // Movendo sobre uma coluna vazia
      const isOverAColumn = COLUMNS.some((col) => col.id === overId);
      if (isOverAColumn) {
        items[activeIndex].status = overId as any;
        return arrayMove(items, activeIndex, activeIndex);
      }

      return items;
    });
  }

  // A Mágica acontece aqui: Salvar no Banco
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const activeId = active.id as string;
    // O ID onde soltou pode ser um Card ou uma Coluna
    const overId = over.id; 
    
    // Descobre qual é o novo status baseado onde soltou
    let newStatus = '';
    
    // Se soltou em cima de uma coluna
    if (COLUMNS.some(c => c.id === overId)) {
        newStatus = overId as string;
    } 
    // Se soltou em cima de outro card, pega o status desse card
    else {
        const overLead = leads.find(l => l.id === overId);
        if (overLead) newStatus = overLead.status;
    }

    if (!newStatus) return;

    // Atualiza o estado visual final
    setLeads((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId); // Pode ser -1 se for coluna
        
        // Atualiza status
        items[oldIndex].status = newStatus as any;
        
        // Se for reordenação na mesma lista
        if (newIndex !== -1) {
            return arrayMove(items, oldIndex, newIndex);
        }
        return [...items];
    });

    // === INTEGRAÇÃO COM SEU BACKEND ===
    const token = localStorage.getItem('revops-token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

    try {
        await fetch(`${apiUrl}/leads/${activeId}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        console.log("Lead movido com sucesso!");
    } catch (err) {
        console.error("Erro ao salvar movimento", err);
        // Opcional: Reverter estado se der erro
        alert("Erro ao atualizar status do lead.");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-200px)]">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color} // Passando a cor
            leads={leads.filter((l) => l.status === col.id)} // Passando os leads filtrados
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? <KanbanCard lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
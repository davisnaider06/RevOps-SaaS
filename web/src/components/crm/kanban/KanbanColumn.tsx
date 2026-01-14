'use client'

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard, Lead } from "./KanbanCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;     // <--- Adicionado: Para receber a cor da bolinha
  leads: Lead[];     // <--- Mudamos de 'deals: DealType[]' para 'leads: Lead[]'
}

export function KanbanColumn({ id, title, color, leads }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col w-80 shrink-0 h-full">
      {/* Cabeçalho da Coluna */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
            {/* Bolinha Colorida */}
            <div className={`w-3 h-3 rounded-full ${color}`} />
            
            <h3 className="font-semibold text-slate-700">
                {title}
            </h3>
            
            {/* Contador */}
            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {leads.length}
            </span>
        </div>
      </div>

      {/* Área Droppable (Onde solta os cards) */}
      <div
        ref={setNodeRef}
        className="bg-slate-100/50 border border-slate-200 p-2 rounded-lg flex-1 flex flex-col gap-2 shadow-inner min-h-[150px]"
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            // CORREÇÃO AQUI: Passamos 'lead={lead}' em vez de 'deal={deal}'
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
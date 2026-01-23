'use client'

import { GeneratePaymentModal } from "@/components/generate-payment-modal";
import { PixPaymentModal } from "@/components/pix-payment-modal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, User } from "lucide-react";

// O Tipo Lead igual ao da sua página
export interface Lead {
  id: string
  title: string
  contactName: string
  value: number
  status: 'NEW' | 'CONTACT' | 'PROPOSAL' | 'WON' | 'LOST'
  email?: string | null
  phone?: string | null
}

interface KanbanCardProps {
  lead: Lead;
}

export function KanbanCard({ lead }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: { type: "Lead", lead },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-slate-200 border-2 border-dashed border-slate-400 p-4 rounded-lg h-[100px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-md shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group touch-none mb-2"
    >
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight">
          {lead.title}
        </span>
        <GripVertical className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Nome do Contato */}
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
        <User className="h-3 w-3" />
        <span className="truncate">{lead.contactName}</span>
      </div>

      {/* Rodapé: Valor e Botão Pix */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
        
        {/* Mostra o Valor (ou tracinho se for zero) */}
        {Number(lead.value) > 0 ? (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(lead.value)}
          </span>
        ) : (
           <span className="text-[10px] text-slate-400">R$ 0,00</span>
        )}

        {/* Botão Pix (SEMPRE VISÍVEL AGORA) */}
        {/* O onPointerDown impede que clicar no botão inicie o arraste do card */}
        <div onPointerDown={(e) => e.stopPropagation()}>
            <PixPaymentModal 
                defaultAmount={lead.value} 
                leadName={lead.contactName} 
                leadPhone={lead.phone || undefined} // Garante que não vá null
            />
        </div>

      </div>
    </div>
  );
}
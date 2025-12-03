"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear 
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Props {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  date,
  setDate,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false)

  const applyPreset = (preset: DateRange) => {
    setDate(preset)
    setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-col gap-1 p-2 border-r border-slate-100 min-w-[140px]">
                <span className="text-xs font-semibold text-slate-500 mb-1 px-2">Atalhos</span>
                
                <Button variant="ghost" className="justify-start text-sm h-8 px-2" onClick={() => applyPreset({
                    from: new Date(),
                    to: new Date()
                })}>
                    Hoje
                </Button>

                <Button variant="ghost" className="justify-start text-sm h-8 px-2" onClick={() => applyPreset({
                    from: subDays(new Date(), 7),
                    to: new Date()
                })}>
                    Últimos 7 dias
                </Button>

                <Button variant="ghost" className="justify-start text-sm h-8 px-2" onClick={() => applyPreset({
                    from: subDays(new Date(), 30),
                    to: new Date()
                })}>
                    Últimos 30 dias
                </Button>

                <Button variant="ghost" className="justify-start text-sm h-8 px-2" onClick={() => applyPreset({
                    from: startOfMonth(new Date()),
                    to: endOfMonth(new Date())
                })}>
                    Este Mês
                </Button>

                <Button variant="ghost" className="justify-start text-sm h-8 px-2" onClick={() => applyPreset({
                    from: startOfMonth(subMonths(new Date(), 1)),
                    to: endOfMonth(subMonths(new Date(), 1))
                })}>
                    Mês Passado
                </Button>

                <Button variant="ghost" className="justify-start text-sm h-8 px-2" onClick={() => applyPreset({
                    from: startOfYear(new Date()),
                    to: endOfYear(new Date())
                })}>
                    Este Ano
                </Button>
            </div>
            <div className="p-2">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    locale={ptBR}
                />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
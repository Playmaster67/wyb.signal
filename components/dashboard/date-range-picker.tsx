"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const MS_PER_DAY = 86_400_000;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseISO(s: string): Date {
  return new Date(`${s}T12:00:00.000Z`);
}

function fmtLabel(s: string): string {
  return parseISO(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface Preset {
  label: string;
  range: () => { from: string; to: string };
}

export function DateRangePicker({
  initialFrom,
  initialTo,
}: {
  initialFrom: string;
  initialTo: string;
}) {
  const router       = useRouter();
  const pathname      = usePathname();
  const searchParams  = useSearchParams();

  const [today] = useState(() => new Date());
  const todayMs  = today.getTime();
  const todayISO = useMemo(() => isoDate(today), [today]);
  const yesterdayISO = useMemo(() => isoDate(new Date(todayMs - MS_PER_DAY)), [todayMs]);

  const PRESETS: Preset[] = useMemo(() => [
    { label: "Hoje",            range: () => ({ from: todayISO,     to: todayISO }) },
    { label: "Ontem",           range: () => ({ from: yesterdayISO, to: yesterdayISO }) },
    { label: "Últimos 7 dias",  range: () => ({ from: isoDate(new Date(todayMs - 6 * MS_PER_DAY)),  to: todayISO }) },
    { label: "Últimos 14 dias", range: () => ({ from: isoDate(new Date(todayMs - 13 * MS_PER_DAY)), to: todayISO }) },
    { label: "Últimos 30 dias", range: () => ({ from: isoDate(new Date(todayMs - 29 * MS_PER_DAY)), to: todayISO }) },
    { label: "Últimos 90 dias", range: () => ({ from: isoDate(new Date(todayMs - 89 * MS_PER_DAY)), to: todayISO }) },
  ], [todayISO, yesterdayISO, todayMs]);

  const [open, setOpen]   = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>({
    from: parseISO(initialFrom),
    to:   parseISO(initialTo),
  });

  function applyRange(from: string, to: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from);
    params.set("to", to);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  function handlePreset(preset: Preset) {
    const r = preset.range();
    setDraft({ from: parseISO(r.from), to: parseISO(r.to) });
    applyRange(r.from, r.to);
  }

  function handleCalendarSelect(range: DateRange | undefined) {
    setDraft(range);
    if (range?.from && range?.to) {
      applyRange(isoDate(range.from), isoDate(range.to));
    }
  }

  const label = initialFrom === initialTo
    ? fmtLabel(initialFrom)
    : `${fmtLabel(initialFrom)} – ${fmtLabel(initialTo)}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        <CalendarIcon className="size-3.5" />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="flex flex-col gap-0.5 p-2 border-r border-wyb-border min-w-[140px]">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className="text-left text-[12px] px-2 py-1.5 rounded-[6px] text-wyb-muted hover:bg-wyb-surface-2 hover:text-wyb-text transition-colors whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={draft}
            onSelect={handleCalendarSelect}
            defaultMonth={draft?.from}
            numberOfMonths={2}
            locale={ptBR}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

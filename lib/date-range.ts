const MS_PER_DAY = 86_400_000;

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return isoDate(new Date());
}

export interface DayRange {
  from: string;
  to: string;
}

// Sem trava de data — passado ou futuro sem evento simplesmente conta zero.
export function resolveRange(fromParam?: string, toParam?: string): DayRange {
  const defaultFrom = isoDate(new Date(Date.now() - 29 * MS_PER_DAY)); // últimos 30 dias
  const from = fromParam ?? defaultFrom;
  const to   = toParam ?? todayISO();
  return from <= to ? { from, to } : { from: to, to: from };
}

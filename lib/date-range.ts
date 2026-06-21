const MS_PER_DAY = 86_400_000;

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return isoDate(new Date());
}

// Eventos reais só existem a partir de ontem — não há dado anterior a isso.
export function minAvailableISO(): string {
  return isoDate(new Date(Date.now() - MS_PER_DAY));
}

export function clampToAvailable(dateISO: string): string {
  const min = minAvailableISO();
  const max = todayISO();
  if (dateISO < min) return min;
  if (dateISO > max) return max;
  return dateISO;
}

export interface DayRange {
  from: string;
  to: string;
}

export function resolveRange(fromParam?: string, toParam?: string): DayRange {
  const from = clampToAvailable(fromParam ?? minAvailableISO());
  const to   = clampToAvailable(toParam ?? todayISO());
  return from <= to ? { from, to } : { from: to, to: from };
}

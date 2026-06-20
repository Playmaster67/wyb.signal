/**
 * Cores para atributos SVG do Recharts (stroke/fill).
 * SVG presentation attributes não suportam var() — estes valores DEVEM
 * espelhar os tokens CSS em app/globals.css.
 *
 * Para cores em className/style React, use sempre var(--wyb-*) ou bg-wyb-*.
 */
export const C = {
  accent:      "#6D5FE0", // var(--wyb-accent)
  accentSoft:  "#EFEDFC", // var(--wyb-accent-soft)
  pos:         "#13885F", // var(--wyb-pos)
  neg:         "#CE3F57", // var(--wyb-neg)
  neutral:     "#9893A6", // var(--wyb-neutral)
  faint:       "#A39DB3", // var(--wyb-faint)
  muted:       "#716A82", // var(--wyb-muted)
  border:      "#ECEAF5", // var(--wyb-border)
  surface2:    "#F4F2FB", // var(--wyb-surface-2)
  // Componentes RGB do accent para uso em rgba()
  accentRgb:   "109,95,224", // #6D5FE0
} as const;

"use client";

import { cn } from "@/lib/utils";
import { C } from "@/lib/chart-colors";

const DAYS  = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const SLOTS = ["00–02", "03–05", "06–08", "09–11", "12–14", "15–17", "18–20", "21–23"];

const raw: number[][] = [
  [  4,  2,  1,  3,  5,  8, 14, 18 ], // Dom
  [  2,  1,  1,  4,  6,  7,  9, 11 ], // Seg
  [  2,  1,  1,  3,  5,  6,  8, 10 ], // Ter
  [  3,  1,  1,  4,  6,  7, 10, 12 ], // Qua
  [  3,  2,  1,  4,  6,  8, 11, 14 ], // Qui
  [  5,  2,  1,  5,  7, 10, 16, 21 ], // Sex
  [  6,  3,  2,  5,  8, 11, 17, 22 ], // Sáb
];

const maxVal = Math.max(...raw.flat());

function cellOpacity(v: number) {
  return 0.08 + (v / maxVal) * 0.82;
}

function cellTextClass(v: number) {
  if (v === 0)  return "";
  if (v < 5)   return "text-wyb-faint";
  if (v < 12)  return "text-wyb-muted";
  return "text-wyb-accent font-semibold";
}

const LEGEND_OPACITIES = [0.1, 0.25, 0.45, 0.65, 0.87];

export function ConversionHeatmap() {
  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
      <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted mb-3">
        FTDs por hora — dia × período
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="pb-2 pr-2 text-left font-medium text-wyb-faint w-8" />
              {SLOTS.map((s) => (
                <th key={s} className="pb-2 px-1 font-medium text-wyb-faint whitespace-nowrap text-center">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, di) => (
              <tr key={day}>
                <td className="pr-2 py-0.5 font-medium text-wyb-muted whitespace-nowrap">{day}</td>
                {SLOTS.map((_, si) => {
                  const v = raw[di][si];
                  return (
                    <td key={si} className="px-0.5 py-0.5">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-[4px] text-[10px]",
                          cellTextClass(v)
                        )}
                        style={{
                          height: 28,
                          minWidth: 32,
                          background: `rgba(${C.accentRgb},${cellOpacity(v)})`,
                          fontVariantNumeric: "tabular-nums",
                        }}
                        title={`${day} ${SLOTS[si]}: ${v} FTDs`}
                      >
                        {v > 0 ? v : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-[11px] text-wyb-faint">Baixo</span>
        {LEGEND_OPACITIES.map((o) => (
          <div
            key={o}
            className="h-3 w-5 rounded-[3px]"
            style={{ background: `rgba(${C.accentRgb},${o})` }}
          />
        ))}
        <span className="text-[11px] text-wyb-faint">Alto</span>
      </div>
    </div>
  );
}

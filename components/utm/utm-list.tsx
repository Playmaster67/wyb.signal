"use client";

import { useState, useMemo, useEffect } from "react";
import { Copy, Check, Search, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Row {
  id: string;
  name: string;
  country: string;
  utm_id: string;
  status: "active" | "inactive";
  total_ftds: number;
}

const DATA: Row[] = [
  { id: "1", name: "thunder_br",   country: "BR", utm_id: "a3k9f2", status: "active",   total_ftds: 89 },
  { id: "2", name: "vitinho_fx",   country: "BR", utm_id: "b7m2x1", status: "active",   total_ftds: 74 },
  { id: "3", name: "camila.odds",  country: "BR", utm_id: "c9p4n8", status: "active",   total_ftds: 61 },
  { id: "4", name: "betmaster_mx", country: "MX", utm_id: "d2q7r3", status: "active",   total_ftds: 53 },
  { id: "5", name: "lukasbet",     country: "BR", utm_id: "e5s1t6", status: "active",   total_ftds: 44 },
  { id: "6", name: "analista_cl",  country: "CL", utm_id: "f8u3v9", status: "inactive", total_ftds: 38 },
  { id: "7", name: "rodrigo_vip",  country: "BR", utm_id: "g1w6y2", status: "active",   total_ftds: 29 },
  { id: "8", name: "palpiteiro",   country: "BR", utm_id: "h4z9a5", status: "active",   total_ftds: 19 },
];

// ─── UTM chip com copy ────────────────────────────────────────────────────────
function UtmChip({ utmId }: { utmId: string }) {
  const [copied, setCopied] = useState(false);
  const param = `utm_inf=${utmId}`;

  function handleCopy() {
    try { navigator.clipboard.writeText(param); } catch { /* */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group/chip inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] border transition-colors text-left",
        copied
          ? "border-wyb-pos/40 bg-wyb-pos/5"
          : "border-wyb-border bg-wyb-surface-2 hover:border-wyb-accent/30 hover:bg-wyb-accent-soft"
      )}
      title="Clique para copiar"
    >
      <span className="font-mono text-[12px] text-wyb-text tabular-nums">
        {param}
      </span>
      <span
        className={cn(
          "shrink-0 transition-colors",
          copied ? "text-wyb-pos" : "text-wyb-faint group-hover/chip:text-wyb-accent"
        )}
      >
        {copied
          ? <Check className="size-3" />
          : <Copy className="size-3" />
        }
      </span>
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function UTMList() {
  const [searchRaw, setSearchRaw] = useState("");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchRaw), 250);
    return () => clearTimeout(t);
  }, [searchRaw]);

  const rows = useMemo(() => {
    if (!search) return DATA;
    const q = search.toLowerCase();
    return DATA.filter(
      (r) => r.name.toLowerCase().includes(q) || r.utm_id.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[18px] font-semibold text-wyb-text leading-none">UTMs</h1>
        <p className="text-[12px] text-wyb-muted mt-1">
          Identificadores únicos por influencer — imutáveis após criação
        </p>
      </div>

      {/* ── Info banner ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-[8px] border border-wyb-accent/20 bg-wyb-accent-soft">
        <Info className="size-3.5 text-wyb-accent shrink-0 mt-0.5" />
        <p className="text-[12px] text-wyb-muted leading-relaxed">
          Copie o parâmetro completo e use diretamente na URL do afiliado.
          Para montar links completos, use a tela{" "}
          <span className="font-medium text-wyb-text">Links</span>.
          O UTM ID nunca é regerado — ele é imutável.
        </p>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="relative max-w-[280px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-wyb-faint pointer-events-none" />
        <Input
          placeholder="Buscar handle ou UTM ID…"
          value={searchRaw}
          onChange={(e) => setSearchRaw(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
        <table className="w-full text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr className="border-b border-wyb-border">
              {["Handle", "Parâmetro UTM", "Status", "FTDs"].map((h) => (
                <th
                  key={h}
                  className={cn(
                    "px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-wyb-muted text-left whitespace-nowrap select-none",
                    h === "FTDs" && "text-right"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-wyb-muted">
                  {searchRaw
                    ? `Nenhum resultado para "${searchRaw}"`
                    : "Nenhum influencer encontrado."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-wyb-border last:border-0 hover:bg-wyb-surface-2 transition-colors",
                    row.status === "inactive" && "opacity-70"
                  )}
                  style={{ height: 48 }}
                >
                  {/* Handle */}
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-wyb-text">{row.name}</span>
                      {row.country && (
                        <span className="font-mono text-[11px] text-wyb-faint">{row.country}</span>
                      )}
                    </div>
                  </td>

                  {/* UTM chip */}
                  <td className="px-4">
                    <UtmChip utmId={row.utm_id} />
                  </td>

                  {/* Status */}
                  <td className="px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] px-1.5 py-0 h-5 rounded-[4px] border",
                        row.status === "active"
                          ? "border-wyb-pos/30 text-wyb-pos bg-wyb-pos/5"
                          : "border-amber-500/30 text-amber-500 bg-amber-500/5"
                      )}
                    >
                      {row.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>

                  {/* FTDs */}
                  <td className="px-4 text-right tabular-nums font-semibold text-wyb-text">
                    {row.total_ftds}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer count */}
        <div className="px-4 py-3 border-t border-wyb-border">
          <span className="text-[12px] text-wyb-muted">
            {rows.length} de {DATA.length} influencer{DATA.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </>
  );
}

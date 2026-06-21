"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Link2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createLinkAction, toggleLinkActiveAction } from "@/app/(dashboard)/links/actions";
import type { LinkInfluencer as Influencer, LinkRow as Link } from "@/lib/links/data";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildFullUrl(base: string, utmId: string): string {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}utm_inf=${utmId}`;
}

function validateUrl(url: string): string | null {
  if (!url) return null;
  if (!url.startsWith("https://")) return 'A URL deve começar com "https://"';
  if (url.includes("utm_inf")) return 'A URL já contém o parâmetro "utm_inf"';
  try {
    new URL(url);
    return null;
  } catch {
    return "URL inválida";
  }
}

// ─── CopyButton ───────────────────────────────────────────────────────────────
function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try { navigator.clipboard.writeText(value); } catch { /* */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={handleCopy}
      className={cn(
        "shrink-0 transition-colors",
        copied ? "text-wyb-pos" : "text-wyb-faint hover:text-wyb-muted",
        className
      )}
      aria-label="Copiar"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function LinkBuilder({
  initialInfluencers,
  initialLinks,
}: {
  initialInfluencers: Influencer[];
  initialLinks: Link[];
}) {
  const router = useRouter();
  const influencers = initialInfluencers;
  const links       = initialLinks;

  const [influencerId, setInfluencerId] = useState("");
  const [baseUrl, setBaseUrl]           = useState("");
  const [label, setLabel]               = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [createError, setCreateError]   = useState("");
  const [pendingId, setPendingId]       = useState<string | null>(null);

  const selectedInfluencer = useMemo(
    () => influencers.find((r) => r.id === influencerId) ?? null,
    [influencerId, influencers]
  );

  const urlError  = validateUrl(baseUrl.trim());
  const isValid   = !!influencerId && baseUrl.trim().length > 0 && !urlError;
  const preview   = isValid && selectedInfluencer
    ? buildFullUrl(baseUrl.trim(), selectedInfluencer.utm_id)
    : null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !selectedInfluencer) return;

    setSubmitting(true);
    setCreateError("");
    const result = await createLinkAction(selectedInfluencer.id, baseUrl.trim(), label.trim());
    setSubmitting(false);

    if (result.error) {
      setCreateError(result.error);
      return;
    }

    setBaseUrl("");
    setLabel("");
    // Mantém o influencer selecionado para facilitar criação de múltiplos links
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    setPendingId(id);
    const { error } = await toggleLinkActiveAction(id, !active);
    setPendingId(null);
    if (error) {
      alert(error);
      return;
    }
    router.refresh();
  }

  const activeCount = links.filter((l) => l.active).length;

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[18px] font-semibold text-wyb-text leading-none">Links</h1>
        <p className="text-[12px] text-wyb-muted mt-1">
          Monte e gerencie links de afiliado com UTM embutido
        </p>
      </div>

      {/* ── Builder card ────────────────────────────────────────────────── */}
      <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted mb-4">
          Criar link
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          {/* Row 1: influencer + label */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-wyb-muted">
                Influencer <span className="text-wyb-neg">*</span>
              </label>
              <select
                value={influencerId}
                onChange={(e) => setInfluencerId(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-[13px] text-foreground outline-none transition-colors focus:border-ring"
              >
                <option value="">Selecionar…</option>
                {influencers.map((inf) => (
                  <option key={inf.id} value={inf.id}>
                    {inf.name}{inf.status === "inactive" ? " (Inativo)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-wyb-muted">
                Label{" "}
                <span className="text-wyb-faint font-normal">(opcional)</span>
              </label>
              <Input
                placeholder="ex: landing_jan25"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: URL base */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-wyb-muted">
              URL base <span className="text-wyb-neg">*</span>
            </label>
            <Input
              placeholder="https://dios.bet/"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className={cn(urlError && baseUrl ? "border-wyb-neg focus-visible:border-wyb-neg" : "")}
            />
            {urlError && baseUrl && (
              <div className="flex items-center gap-1.5 text-[11px] text-wyb-neg">
                <AlertCircle className="size-3 shrink-0" />
                {urlError}
              </div>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-wyb-muted">
                Pré-visualização
              </span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] border border-wyb-accent/20 bg-wyb-accent-soft">
                <Link2 className="size-3.5 text-wyb-accent shrink-0" />
                <span className="font-mono text-[12px] text-wyb-text flex-1 break-all">
                  {preview}
                </span>
                <CopyButton value={preview} />
              </div>
            </div>
          )}

          {createError && (
            <div className="flex items-center gap-1.5 text-[11px] text-wyb-neg">
              <AlertCircle className="size-3 shrink-0" />
              {createError}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" disabled={!isValid || submitting}>
              {submitting ? "Criando…" : "Criar link"}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Links table ─────────────────────────────────────────────────── */}
      <div className="border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
        <div className="px-4 py-3 border-b border-wyb-border flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
            Links criados
          </p>
          <span className="text-[12px] text-wyb-muted tabular-nums">
            {links.length} total · {activeCount} ativo{activeCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr className="border-b border-wyb-border">
                {["Label", "Influencer", "URL completa", "Data", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-wyb-muted text-left whitespace-nowrap select-none"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-wyb-muted">
                    Nenhum link criado ainda.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr
                    key={link.id}
                    className={cn(
                      "border-b border-wyb-border last:border-0 hover:bg-wyb-surface-2 transition-colors",
                      !link.active && "opacity-60"
                    )}
                    style={{ height: 44 }}
                  >
                    {/* Label */}
                    <td className="px-4">
                      {link.label ? (
                        <span className="font-medium text-wyb-text">{link.label}</span>
                      ) : (
                        <span className="text-wyb-faint">—</span>
                      )}
                    </td>

                    {/* Influencer */}
                    <td className="px-4">
                      <span className="text-wyb-muted">{link.influencer_name}</span>
                    </td>

                    {/* URL */}
                    <td className="px-4 max-w-[320px]">
                      <div className="flex items-center gap-1.5 group/url">
                        <span
                          className="font-mono text-[11px] text-wyb-muted truncate"
                          title={link.full_url}
                        >
                          {link.full_url}
                        </span>
                        <CopyButton
                          value={link.full_url}
                          className="opacity-0 group-hover/url:opacity-100"
                        />
                      </div>
                    </td>

                    {/* Data */}
                    <td className="px-4 whitespace-nowrap">
                      <span className="text-wyb-muted">
                        {new Date(link.created_at + "T12:00:00").toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] px-1.5 py-0 h-5 rounded-[4px] border",
                          link.active
                            ? "border-wyb-pos/30 text-wyb-pos bg-wyb-pos/5"
                            : "border-amber-500/30 text-amber-500 bg-amber-500/5"
                        )}
                      >
                        {link.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4">
                      <button
                        onClick={() => handleToggle(link.id, link.active)}
                        disabled={pendingId === link.id}
                        className={cn(
                          "text-[12px] font-medium px-2 py-1 rounded-[6px] transition-colors whitespace-nowrap disabled:opacity-50",
                          link.active
                            ? "text-amber-500 hover:bg-amber-500/10"
                            : "text-wyb-pos hover:bg-wyb-pos/10"
                        )}
                      >
                        {pendingId === link.id ? "…" : link.active ? "Desativar" : "Reativar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

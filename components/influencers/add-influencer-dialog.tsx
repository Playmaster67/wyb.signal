"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Influencer } from "./influencer-list";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (influencer: Influencer) => void;
}

const COUNTRIES = [
  { value: "",      label: "Selecionar (opcional)" },
  { value: "BR",    label: "Brasil" },
  { value: "MX",    label: "México" },
  { value: "CL",    label: "Chile" },
  { value: "AR",    label: "Argentina" },
  { value: "PE",    label: "Peru" },
  { value: "CO",    label: "Colômbia" },
  { value: "PT",    label: "Portugal" },
  { value: "OTHER", label: "Outro" },
];

function genUtmId() {
  return Math.random().toString(36).slice(2, 8);
}

export function AddInfluencerDialog({ open, onOpenChange, onAdd }: Props) {
  const [name, setName]       = useState("");
  const [country, setCountry] = useState("");
  const [error, setError]     = useState("");

  function reset() {
    setName("");
    setCountry("");
    setError("");
  }

  function handleOpenChange(val: boolean) {
    if (!val) reset();
    onOpenChange(val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nome / handle é obrigatório.");
      return;
    }
    onAdd({
      id:          crypto.randomUUID(),
      name:        trimmed,
      country:     country,
      utm_id:      genUtmId(),
      status:      "active",
      links_count: 0,
      total_ftds:  0,
      created_at:  new Date().toISOString().split("T")[0],
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]" showCloseButton>
        <DialogHeader>
          <DialogTitle>Adicionar influencer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-wyb-muted">
              Nome / Handle <span className="text-wyb-neg">*</span>
            </label>
            <Input
              placeholder="ex: thunder_br"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
            />
            {error && <p className="text-[11px] text-wyb-neg">{error}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-wyb-muted">
              País{" "}
              <span className="text-wyb-faint font-normal">(opcional)</span>
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-[13px] text-foreground outline-none transition-colors focus:border-ring"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-wyb-faint -mt-1">
            O UTM ID será gerado automaticamente — único e imutável.
          </p>

          <DialogFooter className="-mx-4 -mb-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

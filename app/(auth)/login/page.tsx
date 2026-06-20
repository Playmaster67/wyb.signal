"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-wyb-bg px-4">
      <div className="w-full max-w-[360px]">

        {/* Marca */}
        <div className="mb-8 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-wyb-accent flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-bold tracking-tight">WYB</span>
            </div>
            <span className="text-[15px] font-semibold text-wyb-text tracking-tight">Signal</span>
          </div>
          <p className="text-[12px] text-wyb-muted">Atribuição de conversões por influencer</p>
        </div>

        {/* Card de login */}
        <div className="bg-wyb-surface rounded-xl shadow-wyb border border-wyb-border p-6">
          <h1 className="text-[14px] font-semibold text-wyb-text mb-5">Entrar na sua conta</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-wyb-text" htmlFor="email">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-wyb-text" htmlFor="password">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-[12px] text-wyb-neg -mt-1">{error}</p>
            )}

            <Button type="submit" className="w-full mt-1 h-9 text-[13px]" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-wyb-faint">
          wybtrackers.com · acesso restrito
        </p>
      </div>
    </div>
  );
}

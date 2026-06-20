"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "7d", value: "7d" },
  { label: "14d", value: "14d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
];

export function PeriodFilter() {
  const [active, setActive] = useState("30d");

  return (
    <div className="flex items-center gap-1 bg-wyb-surface border border-wyb-border rounded-[8px] p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setActive(opt.value)}
          className={cn(
            "px-3 py-1 text-[12px] font-medium rounded-[6px] transition-colors",
            active === opt.value
              ? "bg-wyb-accent text-white"
              : "text-wyb-muted hover:text-wyb-text"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

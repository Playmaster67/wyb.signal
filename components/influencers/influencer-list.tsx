"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type FilterFn,
  type Column,
} from "@tanstack/react-table";
import {
  Plus,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AddInfluencerDialog } from "./add-influencer-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Influencer {
  id: string;
  name: string;
  country: string;
  utm_id: string;
  status: "active" | "inactive";
  links_count: number;
  total_ftds: number;
  created_at: string;
}

type StatusFilter = "all" | "active" | "inactive";

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK: Influencer[] = [
  { id: "1", name: "thunder_br",   country: "BR", utm_id: "a3k9f2", status: "active",   links_count: 3, total_ftds: 89, created_at: "2025-01-15" },
  { id: "2", name: "vitinho_fx",   country: "BR", utm_id: "b7m2x1", status: "active",   links_count: 2, total_ftds: 74, created_at: "2025-02-03" },
  { id: "3", name: "camila.odds",  country: "BR", utm_id: "c9p4n8", status: "active",   links_count: 4, total_ftds: 61, created_at: "2025-02-18" },
  { id: "4", name: "betmaster_mx", country: "MX", utm_id: "d2q7r3", status: "active",   links_count: 2, total_ftds: 53, created_at: "2025-03-07" },
  { id: "5", name: "lukasbet",     country: "BR", utm_id: "e5s1t6", status: "active",   links_count: 1, total_ftds: 44, created_at: "2025-03-21" },
  { id: "6", name: "analista_cl",  country: "CL", utm_id: "f8u3v9", status: "inactive", links_count: 1, total_ftds: 38, created_at: "2025-04-02" },
  { id: "7", name: "rodrigo_vip",  country: "BR", utm_id: "g1w6y2", status: "active",   links_count: 2, total_ftds: 29, created_at: "2025-04-19" },
  { id: "8", name: "palpiteiro",   country: "BR", utm_id: "h4z9a5", status: "active",   links_count: 1, total_ftds: 19, created_at: "2025-05-08" },
];

// ─── Search filter fn ─────────────────────────────────────────────────────────
const searchFilter: FilterFn<Influencer> = (row, _colId, filterValue) => {
  const q = String(filterValue).toLowerCase();
  return (
    row.original.name.toLowerCase().includes(q) ||
    row.original.utm_id.toLowerCase().includes(q)
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function CopyCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try { navigator.clipboard.writeText(value); } catch { /* */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-1.5 group/copy">
      <span className="font-mono text-[12px] text-wyb-muted tabular-nums">{value}</span>
      <button
        onClick={handleCopy}
        aria-label="Copiar UTM ID"
        className="opacity-0 group-hover/copy:opacity-100 transition-opacity text-wyb-faint hover:text-wyb-muted"
      >
        {copied
          ? <Check className="size-3 text-wyb-pos" />
          : <Copy className="size-3" />
        }
      </button>
    </div>
  );
}

function SortHeader({
  column,
  children,
}: {
  column: Column<Influencer, unknown>;
  children: React.ReactNode;
}) {
  if (!column.getCanSort()) return <span>{children}</span>;
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1 hover:text-wyb-text transition-colors"
    >
      {children}
      {sorted === "asc" ? (
        <ChevronUp className="size-3" />
      ) : sorted === "desc" ? (
        <ChevronDown className="size-3" />
      ) : (
        <ChevronsUpDown className="size-3 opacity-40" />
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] px-1.5 py-0 h-5 rounded-[4px] border",
        status === "active"
          ? "border-wyb-pos/30 text-wyb-pos bg-wyb-pos/5"
          : "border-amber-500/30 text-amber-500 bg-amber-500/5"
      )}
    >
      {status === "active" ? "Ativo" : "Inativo"}
    </Badge>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function InfluencerList() {
  const [data, setData]               = useState<Influencer[]>(MOCK);
  const [sorting, setSorting]         = useState<SortingState>([{ id: "total_ftds", desc: true }]);
  const [pagination, setPagination]   = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchRaw, setSearchRaw]     = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialogOpen, setDialogOpen]   = useState(false);

  // Debounce search → reset to page 0 on change
  useEffect(() => {
    const t = setTimeout(() => {
      setGlobalFilter(searchRaw);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchRaw]);

  // Pre-filter by status before TanStack sees the data
  const filteredByStatus = useMemo(
    () => (statusFilter === "all" ? data : data.filter((r) => r.status === statusFilter)),
    [data, statusFilter]
  );

  const handleToggle = useCallback((id: string) => {
    setData((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r
      )
    );
  }, []);

  const handleAdd = useCallback((influencer: Influencer) => {
    setData((prev) => [influencer, ...prev]);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setSearchRaw("");
    setStatusFilter("all");
  }, []);

  const handleStatusFilter = (v: StatusFilter) => {
    setStatusFilter(v);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  // ─── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Influencer>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Handle",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-wyb-text">{row.original.name}</span>
            {row.original.country && (
              <span className="font-mono text-[11px] text-wyb-faint">{row.original.country}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "utm_id",
        header: "UTM ID",
        cell: ({ getValue }) => <CopyCell value={getValue<string>()} />,
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<"active" | "inactive">()} />,
        enableSorting: false,
      },
      {
        accessorKey: "links_count",
        header: "Links",
        cell: ({ getValue }) => (
          <span className="tabular-nums text-wyb-text">{getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "total_ftds",
        header: "FTDs",
        cell: ({ getValue }) => (
          <span className="tabular-nums font-semibold text-wyb-text">{getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Cadastro",
        cell: ({ getValue }) => {
          const d = new Date(getValue<string>() + "T12:00:00");
          return (
            <span className="tabular-nums text-wyb-muted">
              {d.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isActive = row.original.status === "active";
          return (
            <button
              onClick={() => handleToggle(row.original.id)}
              className={cn(
                "text-[12px] font-medium px-2 py-1 rounded-[6px] transition-colors whitespace-nowrap",
                isActive
                  ? "text-amber-500 hover:bg-amber-500/10"
                  : "text-wyb-pos hover:bg-wyb-pos/10"
              )}
            >
              {isActive ? "Desativar" : "Reativar"}
            </button>
          );
        },
        enableSorting: false,
      },
    ],
    [handleToggle]
  );

  // ─── Table ──────────────────────────────────────────────────────────────────
  const table = useReactTable({
    data: filteredByStatus,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: searchFilter,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to   = Math.min((pageIndex + 1) * pageSize, totalRows);

  const activeCount = data.filter((r) => r.status === "active").length;
  const totalCount  = data.length;

  const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: "all",      label: "Todos"   },
    { value: "active",   label: "Ativos"  },
    { value: "inactive", label: "Inativos" },
  ];

  const RIGHT_COLS = new Set(["links_count", "total_ftds"]);

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-wyb-text leading-none">
            Influencers
          </h1>
          <p className="text-[12px] text-wyb-muted mt-1">
            {totalCount} influencer{totalCount !== 1 ? "s" : ""} ·{" "}
            {activeCount} ativo{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="size-3.5" />
          Adicionar
        </Button>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-wyb-faint pointer-events-none" />
          <Input
            placeholder="Buscar handle ou UTM ID…"
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex border border-wyb-border rounded-[8px] overflow-hidden">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusFilter(tab.value)}
              className={cn(
                "px-3 h-8 text-[12px] font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-wyb-accent text-white"
                  : "text-wyb-muted hover:bg-wyb-surface-2 hover:text-wyb-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr className="border-b border-wyb-border">
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-wyb-muted text-left w-10 select-none">
                  #
                </th>
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-wyb-muted whitespace-nowrap select-none",
                      RIGHT_COLS.has(header.id) ? "text-right" : "text-left"
                    )}
                  >
                    <SortHeader column={header.column}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </SortHeader>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-10 text-center text-wyb-muted"
                  >
                    {searchRaw
                      ? `Nenhum resultado para "${searchRaw}"`
                      : "Nenhum influencer encontrado."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-b border-wyb-border last:border-0 hover:bg-wyb-surface-2 transition-colors"
                    style={{ height: 38 }}
                  >
                    <td className="px-4 text-wyb-muted text-[12px]">
                      {pageIndex * pageSize + idx + 1}
                    </td>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4",
                          RIGHT_COLS.has(cell.column.id) && "text-right"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-wyb-border">
          <span className="text-[12px] text-wyb-muted">
            {totalRows === 0 ? "0 resultados" : `${from}–${to} de ${totalRows}`}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ← Anterior
            </Button>
            <span className="px-2 text-[12px] text-wyb-muted tabular-nums">
              {pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima →
            </Button>
          </div>
        </div>
      </div>

      <AddInfluencerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAdd}
      />
    </>
  );
}

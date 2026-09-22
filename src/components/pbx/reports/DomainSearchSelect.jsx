import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Searchable domain picker for report schedules (doc: "Search for a Domain").
 */
export default function DomainSearchSelect({
  domains = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Search for a Domain",
  id,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return domains;
    return domains.filter((d) => String(d).toLowerCase().includes(q));
  }, [domains, query]);

  const selectedLabel = value || placeholder;

  return (
    <div className="relative">
      <Button
        id={id}
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn(
          "w-full justify-between font-normal bg-white",
          !value && "text-slate-500",
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter domains…"
              className="h-8 bg-white"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">No domains match.</li>
            ) : (
              filtered.map((domain) => {
                const selected = domain === value;
                return (
                  <li key={domain}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50",
                        selected && "bg-slate-50 font-medium",
                      )}
                      onClick={() => {
                        onChange?.(domain);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          selected ? "opacity-100 text-blue-600" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{domain}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          {value ? (
            <div className="border-t border-slate-100 p-1">
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-xs text-slate-500 hover:bg-slate-50"
                onClick={() => {
                  onChange?.("");
                  setOpen(false);
                  setQuery("");
                }}
              >
                Clear selection
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <button
          type="button"
          aria-label="Close domain list"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

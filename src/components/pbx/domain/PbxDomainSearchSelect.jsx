import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { domainsMatch } from '@/lib/pbxDomain';

function filterDomains(domains, query) {
  const q = query.trim().toLowerCase();
  if (!q) return domains;
  return domains.filter((d) => {
    const haystack = [d.domain, d.description, d.name, d.reseller]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export default function PbxDomainSearchSelect({
  domains,
  value,
  onValueChange,
  className,
  disabled,
  emptyMessage = 'No domains available.',
  triggerClassName,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const optionRefs = useRef([]);

  const filtered = useMemo(
    () =>
      [...filterDomains(domains, query)].sort((a, b) =>
        (a.domain || '').localeCompare(b.domain || '', undefined, { sensitivity: 'base' })
      ),
    [domains, query]
  );

  const selectedRecord = useMemo(
    () => domains.find((item) => domainsMatch(item.domain, value)) || null,
    [domains, value]
  );

  useEffect(() => {
    if (!open) {
      setQuery('');
      setHighlightedIndex(0);
      return;
    }
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, filtered.length]);

  useEffect(() => {
    const node = optionRefs.current[highlightedIndex];
    if (node && listRef.current) {
      node.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = (domainName) => {
    onValueChange(domainName);
    setOpen(false);
    setQuery('');
    setHighlightedIndex(0);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!filtered.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => Math.min(current + 1, filtered.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSelect(filtered[highlightedIndex].domain);
    }
  };

  const triggerLabel = value
    ? selectedRecord?.domain || value
    : domains.length
      ? 'Select domain'
      : 'No domains loaded';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            'w-full sm:max-w-md justify-between bg-white/10 border-white/20 text-white hover:bg-white/15 hover:text-white',
            triggerClassName,
            className
          )}
        >
          <span className="truncate font-mono text-left">{triggerLabel}</span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 opacity-70 transition-transform', open && 'rotate-180')}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[18rem] max-w-[min(24rem,90vw)] p-0 z-[60]"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={domains.length ? `Search ${domains.length} domains…` : 'Search domains…'}
              className="h-9 pl-9"
              aria-label="Search domains"
              disabled={!domains.length}
            />
          </div>
        </div>

        <div
          ref={listRef}
          className="max-h-64 overflow-y-auto overscroll-contain p-1"
          role="listbox"
          aria-label="Domain list"
        >
          {!domains.length ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{emptyMessage}</p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No domains match your search.</p>
          ) : (
            filtered.map((item, index) => {
              const selected = domainsMatch(item.domain, value);
              const highlighted = index === highlightedIndex;
              return (
                <button
                  key={item.domain}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                    selected && 'bg-accent/50',
                    highlighted && !selected && 'bg-accent/30'
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelect(item.domain)}
                >
                  <Check
                    className={cn('h-4 w-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono">{item.domain}</span>
                    {item.description || item.name ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.description || item.name}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {domains.length > 0 ? (
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
            {filtered.length} of {domains.length} domains
            {filtered.length > 8 ? ' — scroll for more' : ''}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

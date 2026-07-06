import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function filterUsers(users, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return users.filter((user) => {
    const haystack = [user.full_name, user.email].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

export default function UserRecordSearch({ users, onSelectUser, className }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const optionRefs = useRef([]);

  const filtered = useMemo(
    () =>
      [...filterUsers(users, query)].sort((a, b) =>
        (a.full_name || a.email || '').localeCompare(b.full_name || b.email || '', undefined, {
          sensitivity: 'base',
        })
      ),
    [users, query]
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

  const handleSelect = (user) => {
    onSelectUser(user);
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
      handleSelect(filtered[highlightedIndex]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn('w-full justify-between font-normal text-muted-foreground', className)}
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="h-4 w-4 shrink-0 opacity-60" />
            Search users by name or email…
          </span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 opacity-60 transition-transform', open && 'rotate-180')}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[18rem] max-w-[min(28rem,90vw)] p-0 z-50"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={`Search ${users.length} users by name or email…`}
              className="h-9 pl-9"
              aria-label="Search users by name or email"
            />
          </div>
        </div>

        <div
          ref={listRef}
          className="max-h-64 overflow-y-auto overscroll-contain p-1"
          role="listbox"
          aria-label="Matching users"
        >
          {!query.trim() ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Type a name or email address to find a user.
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No users match your search.</p>
          ) : (
            filtered.map((user, index) => {
              const highlighted = index === highlightedIndex;
              return (
                <button
                  key={user.id}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={highlighted}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                    highlighted && 'bg-accent/30'
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(user)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {user.full_name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      '?'}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{user.full_name || '—'}</span>
                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  <Check className="h-4 w-4 shrink-0 opacity-0" />
                </button>
              );
            })
          )}
        </div>

        {query.trim() && filtered.length > 0 ? (
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
            {filtered.length} match{filtered.length === 1 ? '' : 'es'}
            {filtered.length > 8 ? ' — scroll for more' : ''}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

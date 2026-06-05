import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  buildCommandPaletteGroups,
  buildPalettePageUrl,
  filterCommandPaletteGroups,
} from '@/lib/commandPaletteNav';

export default function CommandPalette({ canAccessPage, isAdmin }) {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const groups = useMemo(
    () => buildCommandPaletteGroups({ canAccessPage, isAdmin }),
    [canAccessPage, isAdmin]
  );

  const filteredGroups = useMemo(() => filterCommandPaletteGroups(groups, query), [groups, query]);

  const hasResults = filteredGroups.some((group) => group.items.length > 0);

  const goTo = (path) => {
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    navigate(buildPalettePageUrl(path));
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative flex flex-1 max-w-xl min-w-0">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <Input
        ref={inputRef}
        id="command-palette-search"
        name="command-palette-search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && hasResults) {
            e.preventDefault();
            goTo(filteredGroups[0].items[0].path);
          }
        }}
        placeholder="Search pages…"
        className="pl-10 bg-gray-50 border-gray-200"
        aria-label="Search pages"
        aria-expanded={open}
        aria-autocomplete="list"
        role="combobox"
      />

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[min(360px,50vh)] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {!hasResults ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">No pages found.</p>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.label} className="p-1">
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <button
                    key={`${group.label}-${item.path}`}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goTo(item.path)}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-gray-500" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

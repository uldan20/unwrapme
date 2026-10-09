'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/templates/rak-buku/lib/utils';

export type Option = {
  value: string;
  label: string;
  /** Shown small, under the label — the date, or the chapter it belongs to. */
  hint?: string;
  /** How many photographs are behind this option. */
  count?: number;
  /** Drawn before the label. Used for the heart on “yours”. */
  icon?: React.ReactNode;
  /** Start a new group above this one. */
  divide?: boolean;
};

/** Past this many options the list gets a search field. */
export const SEARCH_FROM = 8;

/**
 * One filter, however long the list behind it gets.
 *
 * The album used to lay every date out as a row of chips, which was fine at two
 * and unusable at twenty — and the whole point of this site is that it keeps
 * having dates added to it. A single button that opens a scrolling, searchable
 * list costs the same room whether there are three chapters or three hundred.
 */
export default function Picker({
  label,
  options,
  value,
  onChange,
  align = 'left',
}: {
  /** Said above the button, so the control explains itself. */
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const listId = useId();

  const current = options.find((o) => o.value === value) ?? options[0];
  const searchable = options.length > SEARCH_FROM;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || (o.hint ?? '').toLowerCase().includes(q)
    );
  }, [options, query]);

  /* Reopening should always start clean, and start on whatever is chosen. */
  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    if (searchable) window.setTimeout(() => field.current?.focus(), 40);
  }, [open, options, value, searchable]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', away);
    return () => window.removeEventListener('pointerdown', away);
  }, [open]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(shown.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && shown[active]) {
      e.preventDefault();
      choose(shown[active].value);
    }
  };

  return (
    <div ref={wrap} className="relative" onKeyDown={onKey}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={cn(
          'flex w-full items-center gap-2 rounded-full border px-4 py-2 transition sm:px-5',
          open
            ? 'border-rb-accent/60 bg-rb-accent/12 text-rb-fg'
            : 'border-rb-fg/12 text-rb-fg-soft hover:border-rb-accent/40 hover:text-rb-fg'
        )}
      >
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-rb-body text-[0.46rem] uppercase tracking-label text-rb-fg-dim">
            {label}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 truncate font-rb-body text-[0.56rem] uppercase tracking-label sm:text-[0.6rem]">
            {current?.icon}
            <span className="truncate">{current?.label}</span>
            {current?.count != null ? (
              <span className="text-rb-fg-dim">· {current.count}</span>
            ) : null}
          </span>
        </span>
        <ChevronDown
          size={13}
          className={cn('shrink-0 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={listId}
            role="listbox"
            className={cn(
              'absolute top-full z-50 mt-2 w-[min(20rem,80vw)] overflow-hidden rounded-2xl',
              'border border-rb-accent/20 bg-rb-bg-deep/95 shadow-frame backdrop-blur-xl',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {searchable ? (
              <div className="flex items-center gap-2 border-b border-rb-fg/10 px-4 py-3">
                <Search size={12} className="shrink-0 text-rb-fg-dim" />
                <input
                  ref={field}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder="cari kencan"
                  aria-label={`Cari ${label}`}
                  className="w-full bg-transparent font-rb-display text-sm italic text-rb-fg outline-none placeholder:text-rb-fg-dim/60"
                />
              </div>
            ) : null}

            <div className="max-h-[min(22rem,52vh)] overflow-y-auto p-1.5">
              {shown.length === 0 ? (
                <p className="px-3 py-6 text-center font-rb-display text-sm italic text-rb-fg-dim">
                  Nggak ada yang namanya itu.
                </p>
              ) : null}

              {shown.map((option, i) => {
                const picked = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={picked}
                    onClick={() => choose(option.value)}
                    onPointerEnter={() => setActive(i)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                      option.divide && i > 0 && 'mt-1.5 border-t border-rb-fg/10 pt-3',
                      picked
                        ? 'bg-rb-accent/12'
                        : i === active
                          ? 'bg-rb-fg/[0.06]'
                          : 'hover:bg-rb-fg/[0.06]'
                    )}
                  >
                    {option.icon ? (
                      <span className="shrink-0 text-rb-accent">{option.icon}</span>
                    ) : null}

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate font-rb-display text-[0.95rem] italic',
                          picked ? 'text-rb-fg' : 'text-rb-fg-soft/85'
                        )}
                      >
                        {option.label}
                      </span>
                      {option.hint ? (
                        <span className="rb-label mt-0.5 block truncate !tracking-[0.2em]">
                          {option.hint}
                        </span>
                      ) : null}
                    </span>

                    {option.count != null ? (
                      <span className="rb-label shrink-0 tabular-nums !tracking-[0.12em]">
                        {option.count}
                      </span>
                    ) : null}
                    {picked ? <Check size={13} className="shrink-0 text-rb-accent" /> : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

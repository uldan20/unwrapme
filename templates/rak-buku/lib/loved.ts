'use client';

import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'unwrapme-rakbuku-loved';

/**
 * The photographs she has kept for herself.
 *
 * Held outside React in one module-level set, so the story, the album and the
 * lightbox all read the same thing without anything being threaded through the
 * tree — and written straight to localStorage, so it is still hers next time she
 * opens the site on that device.
 */
let loved = new Set<string>();
let ready = false;
const listeners = new Set<() => void>();
/** useSyncExternalStore compares by identity, so every change needs a new one. */
let snapshot: readonly string[] = [];

function publish() {
  snapshot = [...loved];
  listeners.forEach((fn) => fn());
}

function hydrate() {
  if (ready) return;
  ready = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) loved = new Set(JSON.parse(raw) as string[]);
  } catch {
    // A blocked or full localStorage is not worth breaking the page over.
  }
  publish();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...loved]));
  } catch {
    /* ignore */
  }
}

function subscribe(fn: () => void) {
  hydrate();
  listeners.add(fn);
  /* Another tab, or the same site open twice — keep them agreed. */
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    try {
      loved = new Set(e.newValue ? (JSON.parse(e.newValue) as string[]) : []);
    } catch {
      loved = new Set();
    }
    publish();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

const read = () => snapshot;
/** The server has no idea what she likes, and must not guess. */
const readOnServer = () => EMPTY;
const EMPTY: readonly string[] = [];

export function useLoved() {
  const list = useSyncExternalStore(subscribe, read, readOnServer);

  const toggle = useCallback((src: string) => {
    if (loved.has(src)) loved.delete(src);
    else loved.add(src);
    persist();
    publish();
    return loved.has(src);
  }, []);

  const isLoved = useCallback((src: string) => list.includes(src), [list]);

  return { loved: list, isLoved, toggle, count: list.length };
}

'use client';

import { useSyncExternalStore } from 'react';
import { chapters } from '@/templates/rak-buku/data/story';

const KEY = 'unwrapme-rakbuku-seen';

/**
 * Which days she has already been to.
 *
 * The album is meant to keep growing, and a date added last week sits eight
 * chapters down behind the lazy loading — so on the next visit the opening can
 * say "one new day since you were last here" and take her straight to it. That
 * needs a memory of what the album held the last time she came, which lives in
 * this browser's localStorage alongside the photographs she kept.
 *
 * "New" means *added since she was last here*, not *unread*: the very first
 * visit writes every chapter that exists as seen and shows nothing, because she
 * is about to scroll through all of them anyway. A chapter only stops being new
 * once its title card has actually been on screen, so a date she never reached
 * is still waiting for her next time.
 *
 * Same shape as `loved.ts`: one module-level store, read through
 * useSyncExternalStore, so the opening, the chapter cards and the album's
 * picker all agree without anything threaded through the tree.
 */
let seen = new Set<string>();
let ready = false;
const listeners = new Set<() => void>();

/**
 * Worked out once, when the page first reads storage, and then held for the
 * whole visit — so a mark does not vanish from under her the moment the chapter
 * it is on scrolls into view. Persisted state moves on; this does not.
 */
let fresh: readonly string[] = [];

function publish() {
  listeners.forEach((fn) => fn());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
}

function hydrate() {
  if (ready) return;
  ready = true;

  let stored: string[] | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) stored = JSON.parse(raw) as string[];
  } catch {
    // A blocked or full localStorage is not worth breaking the page over.
  }

  if (stored) {
    seen = new Set(stored);
    fresh = chapters.filter((c) => !seen.has(c.id)).map((c) => c.id);
  } else {
    // First time here: everything that exists is the baseline, nothing is new.
    seen = new Set(chapters.map((c) => c.id));
    fresh = [];
    persist();
  }
  publish();
}

function subscribe(fn: () => void) {
  hydrate();
  listeners.add(fn);
  /* Another tab marking a day as seen should not make this one forget. */
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY || !e.newValue) return;
    try {
      seen = new Set(JSON.parse(e.newValue) as string[]);
    } catch {
      /* keep what we have */
    }
    publish();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

const read = () => fresh;
/** The server has no idea when she was last here, and must not guess. */
const EMPTY: readonly string[] = [];
const readOnServer = () => EMPTY;

/**
 * The chapters that were not in the album the last time she came, oldest first.
 * Empty on the server, on a first visit, and once she has been to all of them.
 */
export function useFresh(): readonly string[] {
  return useSyncExternalStore(subscribe, read, readOnServer);
}

/** She has reached this day. It stops being new from the next visit on. */
export function markSeen(chapterId: string) {
  hydrate();
  if (seen.has(chapterId)) return;
  seen.add(chapterId);
  persist();
  publish();
}

/**
 * The same list as `useFresh`, read straight away rather than on the next
 * render — for deciding where something opens, which has to happen once and
 * before the first frame she sees.
 */
export function readFresh(): readonly string[] {
  hydrate();
  return fresh;
}

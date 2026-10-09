'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';
import { LngLatBounds, Map as MapLibre, setWorkerUrl, type StyleSpecification } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ROMAN } from '@/templates/rak-buku/lib/book';
import { cn } from '@/templates/rak-buku/lib/utils';
import { allShots, chapters, type AlbumShot, type Chapter, type Spot } from '@/templates/rak-buku/data/story';

/* Served from public/vendor by scripts/copy-map-worker.mjs. */
setWorkerUrl('/vendor/maplibre-gl-worker.mjs');

/** A light base map from OpenFreeMap — free, no key — repainted as paper. */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
/** How close two pins can get on screen before they become one stack. */
const STACK_PX = 64;

type Place = {
  spot: Spot;
  chapter: Chapter;
  ci: number;
  lngLat: [number, number];
  cover: string;
  count: number;
};

type Stack = { key: string; places: Place[]; x: number; y: number };

/**
 * Every place in the album on a real map, the way a phone's photo app shows
 * them: a photograph on each spot, with how many were taken there. Pins that
 * would sit on top of each other gather into one stack, and come apart as she
 * zooms in. A tap on a single place opens its photographs; a tap on a stack
 * zooms in on what is inside it.
 *
 * Places are pinned by `at` on the spot in chapters.json — where the place is,
 * not where any one photograph was taken.
 */
export default function AlbumMap({
  focus,
  onOpenInBook,
  onWhole,
}: {
  /** A chapter picked from the day picker while the map is up. */
  focus: { chapterId: string; n: number } | null;
  onOpenInBook: (spotId: string) => void;
  onWhole: (list: AlbumShot[], i: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibre | null>(null);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [chosen, setChosen] = useState<Place | null>(null);
  const [failed, setFailed] = useState(false);

  const places = useMemo<Place[]>(
    () =>
      chapters.flatMap((chapter, ci) =>
        chapter.spots
          .filter((spot) => spot.at)
          .map((spot) => ({
            spot,
            chapter,
            ci,
            lngLat: [spot.at![1], spot.at![0]] as [number, number],
            cover: (spot.shots.find((s) => s.hero) ?? spot.shots[0]).src,
            count: spot.shots.length,
          }))
      ),
    []
  );

  const everything = useMemo(() => allShots(), []);

  /* Work out the stacks from where everything lands on screen right now.
     Greedy and in date order, which is plenty for an album's worth of places
     and keeps the same stack under her finger as the map moves. */
  const restack = useCallback(() => {
    const m = map.current;
    if (!m) return;
    const placed = places.map((p) => ({ p, at: m.project(p.lngLat) }));
    const out: Stack[] = [];
    for (const { p, at } of placed) {
      const near = out.find((s) => Math.hypot(s.x - at.x, s.y - at.y) < STACK_PX);
      if (near) {
        near.places.push(p);
        const n = near.places.length;
        near.x += (at.x - near.x) / n;
        near.y += (at.y - near.y) / n;
      } else {
        out.push({ key: '', places: [p], x: at.x, y: at.y });
      }
    }
    out.forEach((s) => (s.key = s.places.map((p) => p.spot.id).join('+')));
    setStacks(out);
  }, [places]);

  const fitTo = useCallback((list: Place[], animate = true) => {
    const m = map.current;
    if (!m || !list.length) return;
    const bounds = new LngLatBounds(list[0].lngLat, list[0].lngLat);
    list.forEach((p) => bounds.extend(p.lngLat));
    const wide = (box.current?.clientWidth ?? 0) > 700;
    m.fitBounds(bounds, {
      padding: { top: 90, bottom: 70, left: wide ? 110 : 60, right: wide ? 110 : 60 },
      maxZoom: 15,
      duration: animate ? 1400 : 0,
    });
  }, []);

  /* ── the map itself ──────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    let instance: MapLibre | null = null;

    (async () => {
      let style: StyleSpecification;
      try {
        const res = await fetch(STYLE_URL);
        style = paperStyle((await res.json()) as StyleSpecification);
      } catch {
        if (!cancelled) setFailed(true);
        return;
      }
      if (cancelled || !box.current) return;

      instance = new MapLibre({
        container: box.current,
        style,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        center: places[0]?.lngLat ?? [106.93, -6.91],
        zoom: 10,
        fadeDuration: 150,
      });
      instance.touchZoomRotate.disableRotation();
      map.current = instance;

      instance.on('load', () => {
        if (!instance) return;
        addRoute(instance, places);
        fitTo(places, false);
        restack();
      });
      instance.on('move', restack);
      instance.on('resize', restack);
    })();

    return () => {
      cancelled = true;
      instance?.remove();
      map.current = null;
    };
  }, [places, fitTo, restack]);

  /* The day picker, while the map is up, flies to that day's places. */
  useEffect(() => {
    if (!focus) return;
    const list = places.filter((p) => p.chapter.id === focus.chapterId);
    if (list.length === 1) setChosen(list[0]);
    fitTo(list);
  }, [focus, places, fitTo]);

  const tapStack = (stack: Stack) => {
    const m = map.current;
    if (!m) return;
    const sameSpot = stack.places.every(
      (p) => p.lngLat[0] === stack.places[0].lngLat[0] && p.lngLat[1] === stack.places[0].lngLat[1]
    );
    if (stack.places.length === 1 || sameSpot || m.getZoom() >= 15.5) {
      setChosen(stack.places[0]);
      m.easeTo({ center: stack.places[0].lngLat, duration: 700 });
    } else {
      fitTo(stack.places);
    }
  };

  const chosenShots = useMemo(
    () => (chosen ? everything.filter((s) => s.spotId === chosen.spot.id && s.chapterId === chosen.chapter.id) : []),
    [chosen, everything]
  );

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[6px] bg-[#efe5d7] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-[#d6c5a8]">
      {/* Sized by height rather than inset: maplibre-gl.css makes this element
          position: relative, which would collapse an inset box to nothing. */}
      <div ref={box} className="h-full w-full" />

      {/* ── the photographs on the map ──────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stacks.map((stack) => (
          <Pin key={stack.key} stack={stack} chosen={chosen} onTap={() => tapStack(stack)} />
        ))}
      </div>

      {/* a title, like the cartouche on a paper map */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-[3px] border border-[#8a7a62]/40 bg-[#f6efe5]/90 px-4 py-2.5 shadow-sm backdrop-blur sm:left-5 sm:top-5">
        <p className="font-rb-script text-2xl leading-none text-rb-accent-deep">semua tempat kita</p>
        <p className="mt-1 font-rb-body text-[0.5rem] uppercase tracking-label text-[#7a6a5e]">
          {chapters.length} kencan · {places.length} tempat · {places.reduce((n, p) => n + p.count, 0)} foto
        </p>
      </div>

      {failed ? (
        <div className="absolute inset-0 grid place-items-center p-8 text-center">
          <p className="max-w-xs font-rb-hand text-xl text-[#5a4a40]">
            Petanya belum bisa dimuat. Butuh internet, coba lagi sebentar lagi.
          </p>
        </div>
      ) : null}

      {/* ── one place, opened ───────────────────────────────────── */}
      <AnimatePresence>
        {chosen ? (
          <motion.aside
            key={chosen.spot.id}
            className="absolute inset-x-2 bottom-2 z-20 max-h-[62%] overflow-y-auto rounded-[6px] p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] sm:inset-x-auto sm:bottom-auto sm:left-5 sm:top-[5.6rem] sm:max-h-[calc(100%-7rem)] sm:w-[22rem] sm:p-5"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(120,90,60,0.035) 0 1px, transparent 1px 3px), linear-gradient(180deg, #f6efe5, #ece0cf)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => setChosen(null)}
              aria-label="Tutup"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-[#8a7a62]/30 text-[#6b5a4e] transition hover:bg-[#8a7a62]/10"
            >
              <X size={14} />
            </button>

            <p className="pr-10 font-rb-body text-[0.55rem] uppercase tracking-[0.3em] text-[#9a8574]">
              {ROMAN(chosen.ci + 1)} · {chosen.chapter.title} · {chosen.chapter.dateLabel}
            </p>
            <h3 className="mt-1 font-rb-display text-2xl italic leading-tight text-[#3f342d]">{chosen.spot.name}</h3>
            {chosen.spot.line ? (
              <p className="mt-1.5 font-rb-hand text-lg leading-snug text-[#5a4a40]">{chosen.spot.line}</p>
            ) : null}

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {chosenShots.map((shot, i) => (
                <button
                  key={shot.src}
                  type="button"
                  onClick={() => onWhole(chosenShots, i)}
                  className="group relative aspect-square overflow-hidden rounded-[2px] bg-[#e6ddd2]"
                  aria-label={shot.caption}
                >
                  <Image
                    src={shot.src}
                    alt={shot.caption}
                    fill
                    sizes="120px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenInBook(chosen.spot.id)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-rb-accent-deep/50 py-2.5 font-rb-body text-[0.6rem] uppercase tracking-[0.25em] text-rb-accent-deep transition hover:bg-rb-accent-deep hover:text-[#fff3f7]"
            >
              <BookOpen size={13} /> buka halamannya di buku
            </button>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** A photograph standing on its spot, with how many were taken there. */
function Pin({ stack, chosen, onTap }: { stack: Stack; chosen: Place | null; onTap: () => void }) {
  const lead = stack.places[0];
  const count = stack.places.reduce((n, p) => n + p.count, 0);
  const many = stack.places.length > 1;
  const on = !!chosen && stack.places.some((p) => p.spot.id === chosen.spot.id);

  return (
    <button
      type="button"
      onClick={onTap}
      className="pointer-events-auto absolute left-0 top-0"
      style={{ transform: `translate(${stack.x}px, ${stack.y}px) translate(-50%, -100%)` }}
      aria-label={many ? `${stack.places.length} tempat, ${count} foto` : `${lead.spot.name}, ${count} foto`}
    >
      <div className="relative origin-bottom animate-[pin-in_0.35s_ease-out]">
        {/* the ones underneath, fanned out a little, when it is a stack */}
        {many ? (
          <>
            <span className="absolute inset-0 translate-x-[5px] translate-y-[-4px] rotate-[7deg] rounded-[10px] bg-white shadow-md" />
            <span className="absolute inset-0 translate-x-[-4px] translate-y-[-2px] rotate-[-6deg] rounded-[10px] bg-white shadow-md" />
          </>
        ) : null}
        <div
          className={cn(
            'relative h-[58px] w-[58px] overflow-hidden rounded-[10px] border-[3px] bg-white shadow-[0_6px_14px_-4px_rgba(40,20,20,0.6)] transition-transform duration-300 hover:scale-105',
            on ? 'scale-110 border-rb-accent-deep' : 'border-white'
          )}
        >
          <Image src={lead.cover} alt="" fill sizes="64px" className="object-cover" />
        </div>
        <span className="absolute -right-2 -top-2 min-w-[22px] rounded-full bg-rb-accent-deep px-1.5 py-0.5 text-center font-rb-body text-[0.62rem] font-semibold tabular-nums text-white shadow">
          {count}
        </span>
        {/* the little tail pointing at the exact spot */}
        <span
          className={cn(
            'absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[8px] border-x-transparent',
            on ? 'border-t-rb-accent-deep' : 'border-t-white'
          )}
        />
      </div>
    </button>
  );
}

/* ── the base map, repainted as paper ─────────────────────────────── */

const PAPER = {
  ground: '#efe5d7',
  town: '#e9ddcb',
  green: '#d9dfbd',
  water: '#bcd5d3',
  river: '#a9c8c8',
  building: '#e2d4c1',
  road: '#fffaf0',
  casing: '#d6c5a8',
  rail: '#c4ae97',
  border: '#b9a48f',
  ink: '#6b5a4e',
  halo: '#f6efe5',
};

function paperStyle(style: StyleSpecification): StyleSpecification {
  const layers = style.layers.map((layer) => {
    const id = layer.id;
    const paint = { ...(('paint' in layer && layer.paint) || {}) } as Record<string, unknown>;

    if (layer.type === 'background') paint['background-color'] = PAPER.ground;
    else if (layer.type === 'fill') {
      if (/water/.test(id)) paint['fill-color'] = PAPER.water;
      else if (/park|wood|grass|glacier|ice/.test(id)) {
        paint['fill-color'] = PAPER.green;
        paint['fill-opacity'] = 0.75;
      } else if (/building/.test(id)) paint['fill-color'] = PAPER.building;
      else if (/residential|landuse/.test(id)) paint['fill-color'] = PAPER.town;
      else if (/aeroway/.test(id)) paint['fill-color'] = PAPER.town;
    } else if (layer.type === 'line') {
      if (/waterway/.test(id)) paint['line-color'] = PAPER.river;
      else if (/casing/.test(id)) paint['line-color'] = PAPER.casing;
      else if (/railway/.test(id)) paint['line-color'] = PAPER.rail;
      else if (/boundary/.test(id)) paint['line-color'] = PAPER.border;
      else if (/highway|road|aeroway/.test(id)) paint['line-color'] = PAPER.road;
    } else if (layer.type === 'symbol') {
      paint['text-color'] = /water/.test(id) ? '#5f8d92' : PAPER.ink;
      paint['text-halo-color'] = PAPER.halo;
      paint['text-halo-width'] = 1.4;
    }
    return { ...layer, paint } as typeof layer;
  });
  return { ...style, layers };
}

/** The dates in order, as one dashed thread from place to place. */
function addRoute(m: MapLibre, places: Place[]) {
  if (places.length < 2) return;
  m.addSource('our-route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: places.map((p) => p.lngLat) },
    },
  });
  m.addLayer({
    id: 'our-route',
    type: 'line',
    source: 'our-route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#b3203a',
      'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.4, 14, 2.6],
      'line-dasharray': [1.5, 2],
      'line-opacity': 0.75,
    },
  });
}

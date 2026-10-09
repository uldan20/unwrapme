import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Countdown = {
  mode: 'before' | 'after';
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function countdownTo(isoDate: string, now = new Date()): Countdown {
  const target = new Date(`${isoDate}T00:00:00`).getTime();
  const diff = now.getTime() - target;
  const ms = Math.abs(diff);
  return {
    mode: diff >= 0 ? 'after' : 'before',
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
  };
}

export function hasArrived(isoDate: string, now = new Date()) {
  return now.getTime() >= new Date(`${isoDate}T00:00:00`).getTime();
}

/** A stable DOM id for a photograph, so the gallery can jump into the story. */
export function shotAnchor(src: string) {
  return `shot-${src.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

/**
 * The next time her birthday comes around, counting today as still hers until
 * midnight. Works every year without anyone editing a date.
 */
export function nextBirthday(isoDate: string, now = new Date()): Date {
  const [, month, day] = isoDate.split('-').map(Number);
  const thisYear = new Date(now.getFullYear(), month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(thisYear.getTime() + 86_400_000);
  return now.getTime() < endOfDay.getTime()
    ? thisYear
    : new Date(now.getFullYear() + 1, month - 1, day, 0, 0, 0, 0);
}

/** How many birthdays she will have had, counting the one being waited for. */
export function birthdayNumber(isoFirst: string, target: Date) {
  return target.getFullYear() - Number(isoFirst.split('-')[0]) + 1;
}

/**
 * How many days there have been an us, counting the day it became official as
 * day one. Whole
 * days only, worked out from the calendar rather than from elapsed milliseconds,
 * so it turns over at midnight and is not thrown by daylight saving.
 */
export function daysOfUs(isoStart: string, now = new Date()) {
  const [y, m, d] = isoStart.split('-').map(Number);
  const start = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - start) / 86_400_000) + 1;
}

const UNITS = [
  'no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety',
];

/**
 * Numbers written out, because "six dates, eight places, 58 photographs" reads
 * like a receipt and none of the lines that use this are a receipt. Past a
 * hundred it gives up and uses the numeral, which is the point at which a
 * numeral is right anyway.
 */
export function spell(n: number) {
  if (n < 20) return UNITS[n];
  if (n > 99) return String(n);
  const tens = TENS[Math.floor(n / 10)];
  const unit = n % 10;
  return unit ? `${tens}-${UNITS[unit]}` : tens;
}

/**
 * Scroll the page to an element over a fixed time, rather than at whatever
 * speed the browser feels like — a long way down the story should feel like
 * being taken there, not thrown. The target is re-read every frame because
 * chapters on the way mount as they are passed and swap their reserved height
 * for a real one, which would otherwise leave the glide landing short.
 *
 * `offset` leaves that much room above the element — for something that sits
 * at the top of the screen and should not cover it.
 *
 * Anyone who has asked for reduced motion is simply put there.
 */
export function glideTo(el: Element, ms = 1600, offset = 0) {
  const top = () => el.getBoundingClientRect().top + window.scrollY - offset;
  /* The page has `scroll-behavior: smooth`, which would turn every one of these
     frames into its own browser animation. Each step has to land at once. */
  const put = (y: number) => window.scrollTo({ top: y, behavior: 'instant' });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    put(top());
    return;
  }

  const from = window.scrollY;
  const started = performance.now();
  const ease = (t: number) => 1 - Math.pow(1 - t, 4);

  const step = (now: number) => {
    const t = Math.min(1, (now - started) / ms);
    put(from + (top() - from) * ease(t));
    if (t < 1) requestAnimationFrame(step);
    else requestAnimationFrame(settle);
  };

  /* The chapters just passed are still mounting and unmounting for a moment
     after the glide ends, each one nudging the target. Ease onto it for a
     little longer rather than stopping a few pixels short. */
  const settleUntil = started + ms + 500;
  const settle = (now: number) => {
    const gap = top() - window.scrollY;
    if (Math.abs(gap) < 1 || now > settleUntil) return;
    put(window.scrollY + gap * 0.25);
    requestAnimationFrame(settle);
  };

  requestAnimationFrame(step);
}

/**
 * How many whole months from one date to another, or null if the second is not
 * on the same day of the month — a letter dated the twenty-fourth is "one month
 * of us"; one dated any other day is just its date.
 */
export function monthsBetween(isoStart: string, isoDate: string): number | null {
  const [y1, m1, d1] = isoStart.split('-').map(Number);
  const [y2, m2, d2] = isoDate.split('-').map(Number);
  if (d1 !== d2) return null;
  const months = (y2 - y1) * 12 + (m2 - m1);
  return months > 0 ? months : null;
}

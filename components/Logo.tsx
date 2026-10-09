import { cn } from "@/lib/cn";

/**
 * The mark: a gift on a rose tile, its lid just lifting and a heart slipping
 * out — the moment of unwrapping. Kept in step with `app/icon.svg`.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <defs>
        <linearGradient id="unwrapme-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f07a8f" />
          <stop offset="100%" stopColor="#d8355a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#unwrapme-tile)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#fff" strokeOpacity="0.25" />
      {/* box, with the ribbon showing through */}
      <rect x="8.5" y="17" width="15" height="9" rx="1.6" fill="#fff" />
      <rect x="14.7" y="17" width="2.6" height="9" fill="#e04a6a" />
      {/* lid, lifted off and tipping */}
      <g transform="rotate(-10 16 7.1)">
        <rect x="7.5" y="5.2" width="17" height="3.8" rx="1.3" fill="#fff" />
        <rect x="14.7" y="5.2" width="2.6" height="3.8" fill="#e04a6a" />
      </g>
      {/* the heart that comes out */}
      <path
        transform="translate(16 12.9) scale(1.05)"
        d="M0 2.6C-2.6.8-3-1.2-1.6-2.2-.8-2.8 0-2.2 0-1.4 0-2.2.8-2.8 1.6-2.2 3-1.2 2.6.8 0 2.6Z"
        fill="#fff"
      />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Mark />
      <span className="display text-[1.45rem] leading-none">
        Unwrap<span className="italic">me</span>
      </span>
    </span>
  );
}

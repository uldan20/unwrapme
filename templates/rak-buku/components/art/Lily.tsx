import { cn } from '@/templates/rak-buku/lib/utils';

const FRONT = [0, 120, 240];
const BACK = [60, 180, 300];

/**
 * A pink lily seen slightly from the side: three front petals, three behind,
 * with stamens. The section mark used everywhere on the site.
 *
 * It is alive by default. The whole bloom breathes, each petal sways a little
 * out of phase with the others so the flower never sits perfectly still, the
 * stamens catch the light in turn, and the heart glows. All of it is CSS — see
 * `globals.css` — so this stays a plain component with no runtime cost, and the
 * site-wide reduced-motion rule stops all of it for anyone who asks it to.
 *
 * Hovering opens the petals a touch wider and quickens the breath.
 */
export default function Lily({
  className,
  /* the palette's accent, unless a colourway is asked for */
  petal = 'var(--color-rb-accent-soft)',
  petalDeep = 'var(--color-rb-accent-deep)',
  /** Set false where the flower should hold perfectly still. */
  alive = true,
}: {
  className?: string;
  petal?: string;
  petalDeep?: string;
  alive?: boolean;
}) {
  /* Gradient ids have to be unique per colourway, or a second lily in a
     different pink would silently borrow the first one's gradient. Derived from
     the colours rather than a hook so it matches on the server and the client. */
  const uid = `${petal}-${petalDeep}`.replace(/[^a-z0-9]/gi, '');
  const front = `lilyFront-${uid}`;
  const back = `lilyBack-${uid}`;
  const heart = `lilyHeart-${uid}`;

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn('h-10 w-10', alive && 'lily-live', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={front} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="45%" style={{ stopColor: petal }} />
          <stop offset="100%" style={{ stopColor: petalDeep }} />
        </linearGradient>
        <linearGradient id={back} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" style={{ stopColor: petal, stopOpacity: 0.55 }} />
          <stop offset="100%" style={{ stopColor: petalDeep, stopOpacity: 0.35 }} />
        </linearGradient>
        <radialGradient id={heart}>
          <stop offset="0%" stopColor="#FFF3F7" stopOpacity="0.95" />
          <stop offset="55%" style={{ stopColor: petal, stopOpacity: 0.5 }} />
          <stop offset="100%" style={{ stopColor: petal, stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <g className="lily-bloom">
        {/* Back trio, rotated to peek between the front petals */}
        {BACK.map((a, i) => (
          <path
            key={a}
            className="lily-petal lily-petal--back"
            style={{ ['--a' as string]: `${a}deg`, animationDelay: `${i * -1.9}s` }}
            d="M60 60 C 52 34, 50 16, 60 4 C 70 16, 68 34, 60 60 Z"
            fill={`url(#${back})`}
          />
        ))}

        {/* Front trio */}
        {FRONT.map((a, i) => (
          <g key={a}>
            <path
              className="lily-petal"
              style={{ ['--a' as string]: `${a}deg`, animationDelay: `${i * -2.4}s` }}
              d="M60 62 C 48 38, 45 18, 60 2 C 75 18, 72 38, 60 62 Z"
              fill={`url(#${front})`}
            />
            <path
              className="lily-petal lily-vein"
              style={{ ['--a' as string]: `${a}deg`, animationDelay: `${i * -2.4}s` }}
              d="M60 58 C 57 38, 57 22, 60 8"
              stroke="#FFFFFF"
              strokeOpacity="0.5"
              strokeWidth="1"
              fill="none"
            />
          </g>
        ))}
      </g>

      {/* The light in the middle of it, coming and going */}
      <circle className="lily-heart" cx="60" cy="60" r="20" fill={`url(#${heart})`} />

      {/* Stamens */}
      <g stroke={petalDeep} strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M60 60 L 60 44" />
        <path d="M60 60 L 50 48" />
        <path d="M60 60 L 70 48" />
      </g>
      <g style={{ fill: petalDeep }}>
        <ellipse className="lily-anther" style={{ animationDelay: '0s' }} cx="60" cy="42" rx="2.6" ry="1.7" />
        <ellipse
          className="lily-anther"
          style={{ animationDelay: '-1.1s' }}
          cx="49"
          cy="46"
          rx="2.6"
          ry="1.7"
          transform="rotate(-35 49 46)"
        />
        <ellipse
          className="lily-anther"
          style={{ animationDelay: '-2.2s' }}
          cx="71"
          cy="46"
          rx="2.6"
          ry="1.7"
          transform="rotate(35 71 46)"
        />
      </g>
      <circle cx="60" cy="60" r="3.2" fill="#FFF3F7" fillOpacity="0.9" />
    </svg>
  );
}

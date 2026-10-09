import { cn } from "@/lib/cn";

export type SceneKind = "beach" | "cafe" | "city" | "cinema" | "garden" | "mountain" | "cake" | "rings";

/**
 * A painted stand-in for a couple's photograph. The demos never show real
 * people's pictures, so every "photo" on the landing page is one of these small
 * flat illustrations instead: a date place at a time of day, warm like a print.
 *
 * It fills whatever box it is put in (`slice`), so it works as a polaroid, a
 * book cover or a card.
 */
export default function Scene({ kind, className }: { kind: SceneKind; className?: string }) {
  const g = (name: string) => `scene-${kind}-${name}`;

  return (
    <svg
      viewBox="0 0 120 150"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={g("sky")} x1="0" y1="0" x2="0" y2="1">
          {SKY[kind].map((c, i, all) => (
            <stop key={i} offset={`${(i / (all.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id={g("glow")}>
          <stop offset="0%" stopColor="#fff3dc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff3dc" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="120" height="150" fill={`url(#${g("sky")})`} />
      {ART[kind](g)}
      {/* warmth, like a print rather than a screen */}
      <rect width="120" height="150" fill="#ffd9a8" opacity="0.08" />
    </svg>
  );
}

const SKY: Record<SceneKind, string[]> = {
  beach: ["#f6b3a0", "#f7c9a7", "#fde3c2"],
  cafe: ["#5a3a2c", "#7a4e38", "#a06a48"],
  city: ["#141b3a", "#2a2f5c", "#5b4a7a"],
  cinema: ["#120d16", "#1e1626", "#2a1d30"],
  garden: ["#fbd3dc", "#fde6e4", "#f5efe0"],
  mountain: ["#3a2d55", "#7a4f78", "#e59a8f"],
  cake: ["#f7cbda", "#fbe1e8", "#fdf1f3"],
  rings: ["#f5ede4", "#efe3d6", "#e8d8c7"],
};

/* Two little people, side by side, holding hands. Used in the outdoor scenes. */
function Pair({ x, y, s = 1, fill = "#3a2230" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <circle cx="-5" cy="-17" r="3" />
      <path d="M-8 -13 h6 l1 13 h-8 z" />
      <circle cx="5" cy="-18" r="3.2" />
      <path d="M2 -14 h6 l1 14 h-8 z" />
      <path d="M-2 -8 q2 2 4 0" stroke={fill} strokeWidth="1.4" fill="none" />
    </g>
  );
}

const ART: Record<SceneKind, (g: (n: string) => string) => React.ReactNode> = {
  beach: (g) => (
    <>
      <circle cx="78" cy="70" r="26" fill={`url(#${g("glow")})`} />
      <circle cx="78" cy="72" r="13" fill="#fff1d6" />
      <rect y="80" width="120" height="70" fill="#e78f8a" />
      <rect y="86" width="120" height="6" fill="#f2a79a" opacity="0.7" />
      <rect y="97" width="120" height="4" fill="#f2a79a" opacity="0.5" />
      <path d="M0 116 Q 40 106 120 114 V150 H0 Z" fill="#f3d2a6" />
      <Pair x={46} y={128} s={1.25} fill="#4a2a35" />
    </>
  ),
  cafe: (g) => (
    <>
      <rect x="18" y="16" width="84" height="62" rx="3" fill="#2a3557" />
      <circle cx="80" cy="34" r="6" fill="#fff1d6" opacity="0.9" />
      <path d="M18 47 h84 M60 16 v62" stroke="#5a3a2c" strokeWidth="3" />
      <circle cx="40" cy="12" r="22" fill={`url(#${g("glow")})`} opacity="0.7" />
      <path d="M34 0 v8 M30 8 h8 l-2 6 h-4 z" stroke="#2a1a14" fill="#ffd9a0" />
      <rect y="96" width="120" height="54" fill="#3a2419" />
      <rect y="92" width="120" height="6" fill="#c08a5c" />
      <g fill="#fbf6f0">
        <path d="M30 80 h18 v10 q0 6 -9 6 q-9 0 -9 -6 z" />
        <path d="M70 80 h18 v10 q0 6 -9 6 q-9 0 -9 -6 z" />
      </g>
      <path d="M48 83 q5 0 5 4 q0 4 -5 4 M88 83 q5 0 5 4 q0 4 -5 4" stroke="#fbf6f0" strokeWidth="1.6" fill="none" />
      <path d="M36 76 q-3 -5 0 -9 q3 -4 0 -8 M78 76 q-3 -5 0 -9 q3 -4 0 -8" stroke="#fbf6f0" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
      <path d="M56 70 q4 -6 8 0 q-4 6 -8 0z" fill="#e9a5bc" opacity="0.9" />
    </>
  ),
  city: () => (
    <>
      {[[14, 18], [40, 10], [96, 22], [70, 30], [24, 44], [108, 8]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.9" fill="#fff" opacity="0.8" />
      ))}
      <circle cx="88" cy="30" r="8" fill="#f8ecd0" />
      <circle cx="91" cy="28" r="7" fill="#20264a" />
      <g fill="#0d1129">
        <rect x="0" y="78" width="22" height="72" />
        <rect x="20" y="62" width="18" height="88" />
        <rect x="38" y="86" width="20" height="64" />
        <rect x="56" y="54" width="16" height="96" />
        <rect x="72" y="72" width="22" height="78" />
        <rect x="94" y="64" width="26" height="86" />
      </g>
      <g fill="#ffd27a">
        {[
          [5, 86], [12, 96], [24, 70], [30, 84], [26, 100], [44, 94], [60, 62], [64, 76], [60, 98],
          [78, 80], [86, 92], [100, 72], [108, 86], [100, 104], [14, 112], [66, 118], [112, 120],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="3" height="4" opacity={i % 3 ? 0.9 : 0.55} />
        ))}
      </g>
      <rect y="132" width="120" height="18" fill="#191d3a" />
      <Pair x={60} y={146} s={0.9} fill="#05060f" />
    </>
  ),
  cinema: (g) => (
    <>
      <ellipse cx="60" cy="34" rx="58" ry="40" fill={`url(#${g("glow")})`} opacity="0.35" />
      <rect x="10" y="14" width="100" height="46" rx="2" fill="#dfe6f0" />
      <rect x="10" y="14" width="100" height="46" rx="2" fill="#9fb4d6" opacity="0.5" />
      <path d="M10 60 L 0 150 M110 60 L 120 150" stroke="#000" strokeOpacity="0.2" />
      <g fill="#07050a">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={2 + i * 20} y="112" width="16" height="40" rx="5" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={10 + i * 22} y="132" width="18" height="30" rx="5" />
        ))}
      </g>
      <g fill="#140f18">
        <circle cx="54" cy="100" r="7" />
        <circle cx="66" cy="99" r="7.4" />
        <path d="M44 108 q10 -6 32 0 v8 h-32z" />
      </g>
      <path d="M58 92 q2 -3 4 0 q-2 3 -4 0z" fill="#e9a5bc" />
    </>
  ),
  garden: () => (
    <>
      <circle cx="30" cy="30" r="12" fill="#fff6e6" opacity="0.9" />
      <path d="M0 96 Q 60 80 120 94 V150 H0Z" fill="#b9cf9a" />
      <path d="M0 112 Q 60 100 120 110 V150 H0Z" fill="#9dbb80" />
      {[
        [12, 104, "#e9a5bc"], [28, 118, "#f7cbda"], [44, 106, "#c9647f"], [96, 102, "#f7cbda"], [108, 120, "#e9a5bc"],
        [20, 136, "#c9647f"], [88, 134, "#e9a5bc"], [104, 140, "#f7cbda"], [8, 128, "#f7cbda"],
      ].map(([x, y, c], i) => (
        <g key={i}>
          <path d={`M${x} ${y} v10`} stroke="#6c8a52" strokeWidth="1" />
          <circle cx={x as number} cy={y as number} r="3.2" fill={c as string} />
          <circle cx={x as number} cy={y as number} r="1" fill="#fff3dc" />
        </g>
      ))}
      {/* a bouquet held out, wrapped in paper */}
      <path d="M50 150 L 60 104 L 72 150 Z" fill="#f5ede4" stroke="#d8c6b4" />
      {[[56, 98, "#c9647f"], [64, 96, "#e9a5bc"], [60, 90, "#f7cbda"], [52, 92, "#e9a5bc"], [68, 90, "#c9647f"]].map(
        ([x, y, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r="5.5" fill={c as string} />
        )
      )}
    </>
  ),
  mountain: (g) => (
    <>
      <circle cx="60" cy="74" r="40" fill={`url(#${g("glow")})`} opacity="0.4" />
      <path d="M0 92 L 30 58 L 52 80 L 78 46 L 120 90 V150 H0Z" fill="#3b2a4f" />
      <path d="M0 110 L 26 88 L 60 108 L 92 80 L 120 100 V150 H0Z" fill="#241a33" />
      <path d="M0 18 Q 60 34 120 16" stroke="#3a2d55" strokeWidth="0.6" fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 6 + i * 13.5;
        const y = 18 + Math.sin((i / 8) * Math.PI) * 8;
        return <circle key={i} cx={x} cy={y} r="1.8" fill="#ffd27a" />;
      })}
      <rect y="124" width="120" height="26" fill="#160f20" />
      <circle cx="60" cy="126" r="7" fill="#ffb36b" opacity="0.6" />
      <path d="M56 128 l4 -9 l4 9z" fill="#ffd27a" />
      <Pair x={36} y={136} s={0.9} fill="#0a0710" />
    </>
  ),
  cake: () => (
    <>
      {[[16, 20, "#c9647f"], [100, 30, "#e9a5bc"], [24, 60, "#f2c46d"], [96, 64, "#9fb4d6"], [60, 14, "#c9647f"]].map(
        ([x, y, c], i) => (
          <rect key={i} x={x as number} y={y as number} width="4" height="2" fill={c as string} transform={`rotate(${i * 37} ${x} ${y})`} />
        )
      )}
      <ellipse cx="60" cy="132" rx="46" ry="8" fill="#e6c7cf" />
      <rect x="22" y="96" width="76" height="34" rx="4" fill="#fbf6f0" />
      <path d="M22 104 q9 8 19 0 q9 8 19 0 q9 8 19 0 q9 8 19 0" stroke="#e9a5bc" strokeWidth="5" fill="none" />
      <rect x="32" y="72" width="56" height="26" rx="4" fill="#f7cbda" />
      <path d="M32 78 q7 6 14 0 q7 6 14 0 q7 6 14 0 q7 6 14 0" stroke="#fbf6f0" strokeWidth="4" fill="none" />
      {[46, 60, 74].map((x) => (
        <g key={x}>
          <rect x={x - 1.5} y="56" width="3" height="16" fill="#9fb4d6" />
          <path d={`M${x} 46 q4 5 0 9 q-4 -4 0 -9z`} fill="#f2a54a" />
          <circle cx={x} cy="51" r="6" fill="#fff3dc" opacity="0.5" />
        </g>
      ))}
    </>
  ),
  rings: (g) => (
    <>
      <circle cx="60" cy="72" r="44" fill={`url(#${g("glow")})`} opacity="0.7" />
      <circle cx="50" cy="76" r="20" stroke="#d6a85a" strokeWidth="5" fill="none" />
      <circle cx="70" cy="76" r="20" stroke="#e9c27a" strokeWidth="5" fill="none" />
      <path d="M66 52 l4 -6 l4 6 l-4 4z" fill="#fff" stroke="#cfd8e6" />
      <path d="M0 130 Q 30 120 60 128 Q 90 136 120 126 V150 H0Z" fill="#e9a5bc" opacity="0.5" />
      <path d="M20 124 q6 -10 12 0 q-6 6 -12 0z M92 128 q6 -10 12 0 q-6 6 -12 0z" fill="#c9647f" opacity="0.7" />
    </>
  ),
};

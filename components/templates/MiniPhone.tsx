import { cn } from "@/lib/cn";

/**
 * A phone to hold a template preview, drawn after a current iPhone: a thin
 * metal frame, a slim black border, the Dynamic Island, a status bar and the
 * home bar. The screen is a size container, so every preview is drawn in `cqw`
 * and looks the same in a gallery card, the hero, or the detail sheet.
 *
 * `dark` is for previews with a dark screen: the status bar and home bar turn white.
 */
export default function MiniPhone({
  children,
  className,
  dark,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const ink = dark ? "text-white" : "text-black";
  return (
    <div className={cn("relative", className)}>
      {/* side buttons, sitting just outside the frame */}
      <span className="absolute -left-[0.9%] top-[17%] h-[3.4%] w-[1.2%] rounded-l-full bg-[linear-gradient(90deg,#55555a,#2a2a2d)]" />
      <span className="absolute -left-[0.9%] top-[23.5%] h-[6.2%] w-[1.2%] rounded-l-full bg-[linear-gradient(90deg,#55555a,#2a2a2d)]" />
      <span className="absolute -left-[0.9%] top-[31%] h-[6.2%] w-[1.2%] rounded-l-full bg-[linear-gradient(90deg,#55555a,#2a2a2d)]" />
      <span className="absolute -right-[0.9%] top-[26%] h-[9.5%] w-[1.2%] rounded-r-full bg-[linear-gradient(270deg,#55555a,#2a2a2d)]" />

      {/* titanium frame */}
      <div className="relative rounded-[16.5%/7.7%] bg-[linear-gradient(150deg,#6b6b70_0%,#2b2b2e_22%,#1c1c1e_50%,#3a3a3d_78%,#76767b_100%)] p-[0.9%] shadow-[0_1px_2px_rgba(0,0,0,0.18),0_12px_24px_-10px_rgba(20,20,40,0.35),0_40px_70px_-30px_rgba(20,20,40,0.45)]">
        {/* black border */}
        <div className="rounded-[15.6%/7.25%] bg-black p-[1.5%] shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.12)]">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[14%/6.5%] [container-type:inline-size]">
            {children}

            {/* status bar, level with the Dynamic Island */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 flex h-[14.5cqw] items-center justify-between px-[9cqw] pt-[0.6cqw] font-sans",
                ink
              )}
            >
              <span className="w-[16cqw] text-center text-[4.1cqw] font-semibold tracking-tight">9:41</span>
              <span className="flex w-[16cqw] items-center justify-center gap-[1.2cqw]">
                <Signal />
                <Wifi />
                <Battery />
              </span>
            </div>
            <span className="pointer-events-none absolute left-1/2 top-[2.8cqw] h-[8.8cqw] w-[30cqw] -translate-x-1/2 rounded-full bg-black" />

            {/* home bar */}
            <span
              className={cn(
                "pointer-events-none absolute bottom-[2cqw] left-1/2 h-[1.25cqw] w-[34cqw] -translate-x-1/2 rounded-full",
                dark ? "bg-white/85" : "bg-black/80"
              )}
            />

            {/* a faint reflection across the glass */}
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_32%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Signal() {
  return (
    <svg viewBox="0 0 18 12" className="h-[2.9cqw] w-auto fill-current">
      <rect x="0" y="8" width="3" height="4" rx="0.8" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
      <rect x="10" y="3" width="3" height="9" rx="0.8" />
      <rect x="15" y="0" width="3" height="12" rx="0.8" />
    </svg>
  );
}

function Wifi() {
  return (
    <svg viewBox="0 0 16 12" className="h-[2.9cqw] w-auto fill-current">
      <path d="M8 12 5.6 9.4a3.4 3.4 0 0 1 4.8 0L8 12Z" />
      <path d="M3.4 7.1a6.5 6.5 0 0 1 9.2 0l-1.3 1.4a4.6 4.6 0 0 0-6.6 0L3.4 7.1Z" />
      <path d="M1.1 4.7a9.8 9.8 0 0 1 13.8 0l-1.3 1.4a7.9 7.9 0 0 0-11.2 0L1.1 4.7Z" />
    </svg>
  );
}

function Battery() {
  return (
    <svg viewBox="0 0 27 13" className="h-[3cqw] w-auto">
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2.2" y="2.2" width="17" height="8.6" rx="2.2" fill="currentColor" />
      <path d="M25 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1S25.8 4.7 25 4.4Z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

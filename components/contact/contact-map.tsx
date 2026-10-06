"use client";

import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { LiveStatus } from "@/components/contact/contact-extras";
import { cn } from "@/lib/utils";
import { LAND_ROWS, MAP_COLS, MAP_ROWS, MAP_STEP, MAP_TOP } from "@/lib/world-dots";

type Place = { lat: number; lon: number };

const COLOMBO: Place = { lat: 6.93, lon: 79.86 };

/** Where visitors usually are, by their browser's time zone (no location permission needed). */
const ZONES: Record<string, Place> = {
  "Europe/London": { lat: 51.5, lon: -0.1 },
  "Europe/Dublin": { lat: 53.3, lon: -6.3 },
  "Europe/Paris": { lat: 48.9, lon: 2.35 },
  "Europe/Berlin": { lat: 52.5, lon: 13.4 },
  "Europe/Amsterdam": { lat: 52.4, lon: 4.9 },
  "Europe/Madrid": { lat: 40.4, lon: -3.7 },
  "Europe/Rome": { lat: 41.9, lon: 12.5 },
  "Europe/Stockholm": { lat: 59.3, lon: 18.1 },
  "Europe/Zurich": { lat: 47.4, lon: 8.5 },
  "Europe/Warsaw": { lat: 52.2, lon: 21 },
  "Europe/Istanbul": { lat: 41, lon: 29 },
  "America/New_York": { lat: 40.7, lon: -74 },
  "America/Toronto": { lat: 43.7, lon: -79.4 },
  "America/Chicago": { lat: 41.9, lon: -87.6 },
  "America/Denver": { lat: 39.7, lon: -105 },
  "America/Los_Angeles": { lat: 34, lon: -118.2 },
  "America/Vancouver": { lat: 49.3, lon: -123.1 },
  "America/Sao_Paulo": { lat: -23.5, lon: -46.6 },
  "America/Mexico_City": { lat: 19.4, lon: -99.1 },
  "Asia/Dubai": { lat: 25.2, lon: 55.3 },
  "Asia/Riyadh": { lat: 24.7, lon: 46.7 },
  "Asia/Qatar": { lat: 25.3, lon: 51.5 },
  "Asia/Kolkata": { lat: 19.1, lon: 72.9 },
  "Asia/Calcutta": { lat: 19.1, lon: 72.9 },
  "Asia/Karachi": { lat: 24.9, lon: 67 },
  "Asia/Dhaka": { lat: 23.8, lon: 90.4 },
  "Asia/Singapore": { lat: 1.35, lon: 103.8 },
  "Asia/Kuala_Lumpur": { lat: 3.1, lon: 101.7 },
  "Asia/Bangkok": { lat: 13.8, lon: 100.5 },
  "Asia/Jakarta": { lat: -6.2, lon: 106.8 },
  "Asia/Manila": { lat: 14.6, lon: 121 },
  "Asia/Hong_Kong": { lat: 22.3, lon: 114.2 },
  "Asia/Shanghai": { lat: 31.2, lon: 121.5 },
  "Asia/Seoul": { lat: 37.6, lon: 127 },
  "Asia/Tokyo": { lat: 35.7, lon: 139.7 },
  "Australia/Perth": { lat: -31.95, lon: 115.9 },
  "Australia/Brisbane": { lat: -27.5, lon: 153 },
  "Australia/Melbourne": { lat: -37.8, lon: 145 },
  "Australia/Sydney": { lat: -33.9, lon: 151.2 },
  "Pacific/Auckland": { lat: -36.8, lon: 174.8 },
  "Africa/Cairo": { lat: 30, lon: 31.2 },
  "Africa/Lagos": { lat: 6.5, lon: 3.4 },
  "Africa/Nairobi": { lat: -1.3, lon: 36.8 },
  "Africa/Johannesburg": { lat: -26.2, lon: 28 },
};

/** For zones not listed: the middle of the region the zone name starts with. */
const REGIONS: Record<string, Place> = {
  Europe: { lat: 50, lon: 10 },
  America: { lat: 40, lon: -90 },
  Asia: { lat: 30, lon: 100 },
  Australia: { lat: -33, lon: 150 },
  Pacific: { lat: -36, lon: 175 },
  Africa: { lat: 5, lon: 20 },
};

/**
 * For visitors in Sri Lanka (or of unknown zone): the route visits hiring hubs in turn. All within
 * reach of Colombo on screen, so each route stays in view beside the message card.
 */
const HUBS = ["Europe/London", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney", "Europe/Berlin", "Asia/Tokyo"];

/** The map's drawn width in px (it overflows the section, which clips it); its height follows. */
const MAP_W = 1320;
const UNIT = MAP_W / MAP_COLS;
/**
 * Where on the section the map is pinned: for a visitor, the middle of their route; for the hub
 * fan, Colombo itself. Both sit low in the left column, in the open space under the email field,
 * clear of the heading above and the message card beside.
 */
const ANCHOR = { x: "30%", y: "70%" };

/** Fades the map out towards the top of the section, clear of the heading. */
const TOP_FADE = "linear-gradient(to bottom, transparent 24%, black 50%)";
const HUB_ANCHOR = { x: "34%", y: "62%" };

/** Seconds per route cycle: the signal crosses, rests a moment, then crosses again. */
const CYCLE = 3.2;

function visitorPlace(): Place | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone || zone === "Asia/Colombo") return null;
    return ZONES[zone] ?? REGIONS[zone.split("/")[0]] ?? null;
  } catch {
    return null;
  }
}

/** Map position of a place: the bitmap's grid, one unit per 2°. */
const toXY = ({ lat, lon }: Place) => ({ x: (lon + 180) / MAP_STEP, y: (MAP_TOP - lat) / MAP_STEP + 0.5 });

/** Every land cell as a zero-length stroke; round caps turn each into a dot. One path for them all. */
const DOTS = LAND_ROWS.map((hex, r) =>
  [...hex]
    .flatMap((ch) => parseInt(ch, 16).toString(2).padStart(4, "0").split(""))
    .map((bit, c) => (bit === "1" ? `M${c + 0.5} ${r + 0.5}h0` : ""))
    .join("")
).join("");

/** A flight-path arc from Colombo to a place: bowed upward in proportion to its length. */
function arcTo(place: Place) {
  const a = toXY(COLOMBO);
  const b = toXY(place);
  const lift = Math.hypot(b.x - a.x, b.y - a.y) * 0.35;
  return { b, lift, d: `M${a.x} ${a.y}Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - lift} ${b.x} ${b.y}` };
}

/**
 * A dotted world map behind the Contact section, with a glowing route from Colombo to wherever the
 * visitor is (judged from their time zone) and a signal travelling along it: "you're there, I'm
 * here". Visitors in Sri Lanka see routes fanning out to hiring hubs, each lit in turn. Drawn after
 * mount, so the server never sends the dots. Still, with no travelling signal, for reduced motion.
 */
export function ContactMap() {
  const mounted = useHasMounted();
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [hub, setHub] = useState(0);
  const visitor = mounted ? visitorPlace() : null;

  // No visitor location: light the next hub's route after each crossing.
  useEffect(() => {
    if (!mounted || visitor || reduce) return;
    const id = window.setInterval(() => setHub((h) => (h + 1) % HUBS.length), CYCLE * 1000 * 2);
    return () => window.clearInterval(id);
  }, [mounted, visitor, reduce]);

  if (!mounted) return null;

  const a = toXY(COLOMBO);
  const hubs = HUBS.map((zone) => arcTo(ZONES[zone]));
  const active = visitor ? arcTo(visitor) : hubs[hub];
  const b = active.b;
  // Pin the map so what matters sits at the anchor: the route's middle for a visitor, Colombo for
  // the hub fan. The map fades out around that spot.
  const focus = visitor ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - active.lift / 2 } : a;
  const anchor = visitor ? ANCHOR : HUB_ANCHOR;
  const fx = (focus.x / MAP_COLS) * 100;
  const fy = (focus.y / MAP_ROWS) * 100;
  const mask = `radial-gradient(ellipse ${visitor ? "45% 80%" : "50% 90%"} at ${fx}% ${fy}%, black 35%, transparent 100%)`;

  // Colombo on the section, for the status tag pinned beside it.
  const here = { x: `calc(${anchor.x} + ${(a.x - focus.x) * UNIT}px)`, y: `calc(${anchor.y} + ${(a.y - focus.y) * UNIT}px)` };

  return (
    <>
    {/* The map fades out towards the top, so routes dissolve before they reach the heading. */}
    <div aria-hidden className="absolute inset-0" style={{ maskImage: TOP_FADE, WebkitMaskImage: TOP_FADE }}>
    <motion.div
      dir="ltr"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="absolute"
      style={{
        width: MAP_W,
        height: MAP_ROWS * UNIT,
        left: `calc(${anchor.x} - ${focus.x * UNIT}px)`,
        top: `calc(${anchor.y} - ${focus.y * UNIT}px)`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <svg viewBox={`0 0 ${MAP_COLS} ${MAP_ROWS}`} className="size-full overflow-visible">
        <defs>
          <linearGradient id={`route-${uid}`} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
            <stop offset="0%" className="[stop-color:var(--primary)]" />
            <stop offset="100%" className="[stop-color:var(--chart-2)]" />
          </linearGradient>
        </defs>

        <path d={DOTS} className="stroke-foreground/[0.2]" strokeWidth={0.45} strokeLinecap="round" fill="none" />

        {/* Without a visitor location: every hub's route at once, faint, with a dot at each hub. */}
        {!visitor &&
          hubs.map((h) => (
            <g key={h.d} className="text-primary" opacity={0.4}>
              <path d={h.d} fill="none" stroke="currentColor" strokeWidth={0.2} strokeDasharray="0.6 0.8" />
              <circle cx={h.b.x} cy={h.b.y} r={0.45} fill="currentColor" />
            </g>
          ))}

        {/* The live route: a soft glow under a fine line, drawing itself in whenever it changes. */}
        <g key={active.d} opacity={0.8}>
          <motion.path
            d={active.d}
            fill="none"
            stroke={`url(#route-${uid})`}
            strokeWidth={1.1}
            strokeLinecap="round"
            opacity={0.2}
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          <motion.path
            d={active.d}
            fill="none"
            stroke={`url(#route-${uid})`}
            strokeWidth={0.3}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          {!reduce && (
            <circle r={0.6} className="fill-chart-2">
              <animateMotion
                dur={`${CYCLE}s`}
                begin="1.4s"
                repeatCount="indefinite"
                keyPoints="0;1;1"
                keyTimes="0;0.75;1"
                calcMode="linear"
                path={active.d}
              />
            </circle>
          )}
          <Endpoint x={b.x} y={b.y} tone="accent" reduce={!!reduce} />
        </g>
        <Endpoint x={a.x} y={a.y} tone="primary" reduce={!!reduce} />
      </svg>
    </motion.div>
    </div>

    {/* Her live status, pinned beside Colombo where no route runs: below and to the left for the
        hub fan (its routes leave up-left to Europe and the Gulf, and right to Asia and Australia);
        level with it, to the right, for a visitor (Colombo sits low then, and the route climbs away
        to the left). Outside the map's fades, so it stays crisp wherever Colombo lands. */}
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="absolute"
      style={{ left: here.x, top: here.y }}
    >
      <div className={cn(visitor ? "ml-4 -translate-y-1/2" : "-ml-4 -translate-x-full translate-y-3")}>
        <LiveStatus variant="tag" align={visitor ? "start" : "end"} />
      </div>
    </motion.div>
    </>
  );
}

/** A lit dot with a ring pinging out of it. */
function Endpoint({ x, y, tone, reduce }: { x: number; y: number; tone: "primary" | "accent"; reduce: boolean }) {
  const fill = tone === "primary" ? "fill-primary" : "fill-chart-2";
  return (
    <g>
      {!reduce && (
        <circle cx={x} cy={y} r={0.6} className={fill}>
          <animate attributeName="r" values="0.6;2.6" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={x} cy={y} r={0.6} className={fill} />
    </g>
  );
}

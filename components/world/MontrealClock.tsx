"use client";

import { useEffect, useState } from "react";

const CLOCK = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
const TICK_MS = 1000;

/** HUD clock on Montréal time (America/Toronto zone). Renders a placeholder until mounted to avoid hydration mismatches. */
export default function MontrealClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(CLOCK.format(new Date()));
    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="hud-label hud-label--light tabular-nums" aria-hidden="true" data-testid="hud-clock">
      MTL {now ?? "--:--:--"}
    </span>
  );
}

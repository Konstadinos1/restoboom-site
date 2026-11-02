"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { STATION_EVENT } from "@/lib/world/publish";
import { STATION_IDS, type StationId } from "@/lib/world/stations";
import { STATION_LABELS } from "@/lib/world/stationLabels";
import { useScramble } from "./useScramble";

const DECODE_MS = 450;

/** Top-left HUD: "////// 04 — PLATEFORME" for the section the camera is at; the page name elsewhere. */
export default function StationLabel({ locale, fallback }: { locale: Locale; fallback: string }) {
  const [id, setId] = useState<StationId | null>(null);
  useEffect(() => {
    const current = document.documentElement.dataset.activeStation as StationId | undefined;
    if (current && STATION_IDS.includes(current)) setId(current);
    const onStation = (e: Event) => setId((e as CustomEvent<StationId>).detail);
    window.addEventListener(STATION_EVENT, onStation);
    return () => window.removeEventListener(STATION_EVENT, onStation);
  }, []);
  const index = id ? STATION_IDS.indexOf(id) : -1;
  const text = id ? `${String(index + 1).padStart(2, "0")} — ${STATION_LABELS[locale][id]}` : fallback;
  const shown = useScramble(text, DECODE_MS);
  return (
    <span className="hud-label" aria-hidden="true" data-testid="station-label">
      {`////// ${shown}`}
    </span>
  );
}

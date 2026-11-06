"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { createSoundEngine, type SoundEngine } from "@/lib/sound/engine";
import { readMotion, STATION_EVENT } from "@/lib/world/publish";
import { STATION_IDS, type StationId } from "@/lib/world/stations";

const T = { fr: { label: "Son" }, en: { label: "Sound" } } as const;
/** What gets a tick: things you can click. */
const INTERACTIVE = "a, button, summary, select, label, [role=button]";

/** The wind and hum follow the camera, read once per frame while the sound is on. */
function useMotionFollow(engine: SoundEngine | null): void {
  useEffect(() => {
    if (!engine) return;
    let raf = 0;
    const follow = () => {
      engine.setMotion(readMotion());
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(raf);
  }, [engine]);
}

/** A chime each time the HUD moves to a new section (home page only). */
function useStationChimes(engine: SoundEngine | null): void {
  useEffect(() => {
    if (!engine) return;
    const onStation = (e: Event) => engine.chime(STATION_IDS.indexOf((e as CustomEvent<StationId>).detail));
    window.addEventListener(STATION_EVENT, onStation);
    return () => window.removeEventListener(STATION_EVENT, onStation);
  }, [engine]);
}

/** A faint tick when a mouse moves onto a link or button, a firmer one on press. */
function useButtonTicks(engine: SoundEngine | null): void {
  useEffect(() => {
    if (!engine) return;
    let hovered: Element | null = null;
    const target = (e: Event) => (e.target instanceof Element ? e.target.closest(INTERACTIVE) : null);
    const onOver = (e: PointerEvent) => {
      const el = e.pointerType === "mouse" ? target(e) : null;
      if (el && el !== hovered) engine.tick("hover");
      hovered = el;
    };
    const onDown = (e: PointerEvent) => target(e) && engine.tick("press");
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [engine]);
}

/** Off at every page load. The audio context is only created on the first switch-on (a click), as browsers require. */
function useSound() {
  const [engine, setEngine] = useState<SoundEngine | null>(null);
  const [on, setOn] = useState(false);
  const [audioState, setAudioState] = useState("none");
  useEffect(() => () => engine?.dispose(), [engine]);
  useEffect(() => {
    if (!engine || !on) return;
    // Tab in the background: fade out and let the audio sleep; fade back in on return.
    const onVisibility = () => void (document.hidden ? engine.stop() : engine.start()).then(() => setAudioState(engine.state()));
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [engine, on]);
  const toggle = async () => {
    const current = engine ?? createSoundEngine(new AudioContext());
    if (!engine) setEngine(current);
    setOn(!on);
    await (on ? current.stop() : current.start());
    setAudioState(current.state());
  };
  return { on, toggle, audioState, active: on ? engine : null };
}

/** HUD switch for the synthesized sound (wind, hum, chimes, ticks). */
export default function SoundToggle({ locale }: { locale: Locale }) {
  const { on, toggle, audioState, active } = useSound();
  useMotionFollow(active);
  useStationChimes(active);
  useButtonTicks(active);
  return (
    <button type="button" className="sound-toggle hud-label hud-label--light" aria-pressed={on} onClick={toggle} data-audio={audioState} data-testid="sound-toggle" data-track="sound_toggle">
      {T[locale].label}
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

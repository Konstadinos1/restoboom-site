/**
 * Plays the score (score.ts) with the Web Audio API: a looping wind and hum
 * that follow the camera's motion, chimes and ticks on demand, all through
 * one master fader and a gentle compressor. Works on any BaseAudioContext, so
 * an OfflineAudioContext can render it too. Browser-only.
 */
import {
  CHIME_ATTACK, CHIME_PARTIALS, chimeFrequency, ECHO, FADE_SECONDS, GUST, HUM_CUTOFF, HUM_NOTES_HZ, humLevel, MASTER_LEVEL, MOTION_SMOOTHING,
  pinkNoise, TICKS, windCutoff, windLevel, type TickKind,
} from "./score";

export type SoundEngine = {
  /** Fades the sound in (and wakes the context if the browser suspended it). */
  start: () => Promise<void>;
  /** Fades the sound out, then suspends a live context so it stops using the CPU. */
  stop: () => Promise<void>;
  /** 0..1: how hard the camera is diving between sections. */
  setMotion: (motion: number) => void;
  chime: (stationIndex: number) => void;
  tick: (kind: TickKind) => void;
  /** The audio context's state ("running", "suspended"...), or "offline" when rendering to a buffer. */
  state: () => string;
  dispose: () => void;
};

const NOISE_SECONDS = 4;
const NOISE_SEED = 2026;
const SILENCE = 0.0001;
const HUM_DETUNE_CENTS = [-4, 3, 6] as const;
/** Only catches peaks (several chimes at once): the bed and single chimes pass untouched. */
const COMPRESSOR = { threshold: -10, knee: 8, ratio: 6 } as const;
const isLive = (ctx: BaseAudioContext): ctx is AudioContext => typeof AudioContext !== "undefined" && ctx instanceof AudioContext;

type Wind = { gain: GainNode; filter: BiquadFilterNode; sources: AudioScheduledSourceNode[] };

function buildWind(ctx: BaseAudioContext, out: AudioNode): Wind {
  const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate);
  buffer.copyToChannel(pinkNoise(buffer.length, NOISE_SEED), 0);
  const noise = Object.assign(ctx.createBufferSource(), { buffer, loop: true });
  const filter = new BiquadFilterNode(ctx, { type: "bandpass", frequency: windCutoff(0), Q: GUST.q });
  const gain = new GainNode(ctx, { gain: windLevel(0) });
  const gust = new OscillatorNode(ctx, { frequency: GUST.rate });
  const depth = new GainNode(ctx, { gain: GUST.depth });
  gust.connect(depth).connect(filter.frequency);
  noise.connect(filter).connect(gain).connect(out);
  return { gain, filter, sources: [noise, gust] };
}

function buildHum(ctx: BaseAudioContext, out: AudioNode): { gain: GainNode; sources: AudioScheduledSourceNode[] } {
  const gain = new GainNode(ctx, { gain: humLevel(0) });
  const filter = new BiquadFilterNode(ctx, { type: "lowpass", frequency: HUM_CUTOFF });
  filter.connect(gain).connect(out);
  const sources = HUM_NOTES_HZ.map((frequency, i) => {
    const osc = new OscillatorNode(ctx, { type: i === 0 ? "sine" : "triangle", frequency, detune: HUM_DETUNE_CENTS[i] });
    osc.connect(filter);
    return osc;
  });
  return { gain, sources };
}

/** The chimes ring into a short filtered echo. */
function buildEcho(ctx: BaseAudioContext, out: AudioNode): AudioNode {
  const input = new GainNode(ctx);
  const delay = new DelayNode(ctx, { delayTime: ECHO.delay });
  const feedback = new GainNode(ctx, { gain: ECHO.feedback });
  const tone = new BiquadFilterNode(ctx, { type: "lowpass", frequency: ECHO.cutoff });
  input.connect(out);
  input.connect(delay).connect(tone).connect(feedback).connect(delay);
  tone.connect(out);
  return input;
}

/** One sine with a fast attack and an exponential ring-out, scheduled at `at`. */
function blip(ctx: BaseAudioContext, out: AudioNode, at: number, note: { frequency: number; level: number; decay: number; attack: number }): void {
  const osc = new OscillatorNode(ctx, { frequency: note.frequency });
  const env = new GainNode(ctx, { gain: 0 });
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(note.level, at + note.attack);
  env.gain.exponentialRampToValueAtTime(SILENCE, at + note.attack + note.decay);
  osc.connect(env).connect(out);
  osc.start(at);
  osc.stop(at + note.attack + note.decay + 0.05);
}

/** The master fader: fades in and out, and suspends a live context once it is silent. */
function createFader(ctx: BaseAudioContext, master: GainNode): Pick<SoundEngine, "start" | "stop"> {
  const fade = (level: number) => master.gain.setTargetAtTime(level, ctx.currentTime, FADE_SECONDS / 3);
  // Switched back on during the fade-out: the pending suspend must not cut it off.
  let wanted = false;
  return {
    start: async () => {
      wanted = true;
      if (isLive(ctx) && ctx.state !== "running") await ctx.resume();
      fade(MASTER_LEVEL);
    },
    stop: async () => {
      wanted = false;
      fade(0);
      if (!isLive(ctx)) return;
      await new Promise((resolve) => setTimeout(resolve, FADE_SECONDS * 1000));
      if (!wanted && ctx.state === "running") await ctx.suspend();
    },
  };
}

export function createSoundEngine(ctx: BaseAudioContext): SoundEngine {
  const master = new GainNode(ctx, { gain: 0 });
  master.connect(new DynamicsCompressorNode(ctx, { threshold: COMPRESSOR.threshold, knee: COMPRESSOR.knee, ratio: COMPRESSOR.ratio })).connect(ctx.destination);
  const wind = buildWind(ctx, master);
  const hum = buildHum(ctx, master);
  const echo = buildEcho(ctx, master);
  const sources = [...wind.sources, ...hum.sources];
  sources.forEach((s) => s.start());
  return {
    ...createFader(ctx, master),
    setMotion: (motion) => {
      wind.gain.gain.setTargetAtTime(windLevel(motion), ctx.currentTime, MOTION_SMOOTHING);
      wind.filter.frequency.setTargetAtTime(windCutoff(motion), ctx.currentTime, MOTION_SMOOTHING);
      hum.gain.gain.setTargetAtTime(humLevel(motion), ctx.currentTime, MOTION_SMOOTHING);
    },
    chime: (stationIndex) => {
      const root = chimeFrequency(stationIndex);
      CHIME_PARTIALS.forEach((p) => blip(ctx, echo, ctx.currentTime, { frequency: root * p.ratio, level: p.level, decay: p.decay, attack: CHIME_ATTACK }));
    },
    tick: (kind) => {
      const t = TICKS[kind];
      blip(ctx, master, ctx.currentTime, { frequency: t.frequency, level: t.level, decay: t.duration, attack: 0.002 });
    },
    state: () => (isLive(ctx) ? ctx.state : "offline"),
    dispose: () => {
      sources.forEach((s) => s.stop());
      if (isLive(ctx)) void ctx.close();
    },
  };
}

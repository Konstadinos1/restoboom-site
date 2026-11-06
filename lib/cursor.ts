/**
 * The HUD cursor's rules: which look it takes for what is under the pointer.
 * The system cursor always stays visible; this only decides the reticle that
 * trails it. Pure, so it is unit-tested.
 */

/** What <html data-cursor> can ask for (set by the 3D explorer while the pointer is over a cube). */
export const CURSOR_HINTS = ["explore", "close"] as const;
export type CursorHint = (typeof CURSOR_HINTS)[number];

export type CursorMode = "hidden" | "idle" | "link" | CursorHint;

/** What the pointer is over: something to type in (the reticle steps aside), or something to click. */
export type PointerTarget = { textEntry: boolean; clickable: boolean };

export const CLICKABLE = "a, button, summary, label, select, [role=button]";
export const TEXT_ENTRY = "input:not([type=checkbox]):not([type=radio]):not([type=submit]), textarea, select";

export function isCursorHint(value: string | undefined): value is CursorHint {
  return (CURSOR_HINTS as readonly string[]).includes(value ?? "");
}

export function cursorMode(target: PointerTarget | null, hint: string | undefined): CursorMode {
  if (!target) return "hidden";
  if (isCursorHint(hint)) return hint;
  if (target.textEntry) return "hidden";
  return target.clickable ? "link" : "idle";
}

/** The reticle's label for the explore hints. */
export const CURSOR_LABELS = {
  fr: { explore: "Explorer", close: "Fermer" },
  en: { explore: "Explore", close: "Close" },
} as const;

export type Locale = "fr" | "en";

/** FR path -> EN counterpart. Root "/" handled separately. */
const FR_TO_EN: Record<string, string> = {
  "/": "/en/",
  "/tarifs": "/en/pricing",
  "/diagnostic": "/en/diagnostic",
  "/confidentialite": "/en/privacy",
  "/conditions": "/en/terms",
};

export function counterpartPath(frPath: string): string {
  return FR_TO_EN[frPath] ?? "/en/";
}

/** Build the opposite-locale href for the language toggle. */
export function langSwitchHref(current: { locale: Locale; frPath: string }): string {
  if (current.locale === "fr") return counterpartPath(current.frPath);
  // EN -> FR: reverse lookup
  const entry = Object.entries(FR_TO_EN).find(
    ([, en]) => en.replace(/\/$/, "") === current.frPath.replace(/\/$/, "")
  );
  return entry ? entry[0] : "/";
}

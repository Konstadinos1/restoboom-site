import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { assignVariant, experimentBootScript, forcedVariant, hashString, HERO_EXPERIMENT } from "@/lib/experiments";

describe("assignVariant", () => {
  it("is deterministic per visitor", () => {
    expect(assignVariant(HERO_EXPERIMENT, "visitor-1")).toBe(assignVariant(HERO_EXPERIMENT, "visitor-1"));
  });

  it("splits traffic roughly evenly", () => {
    const n = 4000;
    let b = 0;
    for (let i = 0; i < n; i++) if (assignVariant(HERO_EXPERIMENT, `v${i}-${i * 7919}`) === "b") b++;
    expect(b / n).toBeGreaterThan(0.45);
    expect(b / n).toBeLessThan(0.55);
  });

  it("hashString matches FNV-1a reference values", () => {
    expect(hashString("")).toBe(0x811c9dc5);
    expect(hashString("a")).toBe(0xe40c292c);
  });
});

describe("forcedVariant", () => {
  it("honours a valid ?ab_hero= override and ignores invalid ones", () => {
    expect(forcedVariant(HERO_EXPERIMENT, "?ab_hero=b")).toBe("b");
    expect(forcedVariant(HERO_EXPERIMENT, "?ab_hero=z")).toBeNull();
    expect(forcedVariant(HERO_EXPERIMENT, "")).toBeNull();
  });
});

/** Executes the inline boot script against a fake DOM, the way the browser does pre-paint. */
function runBoot(search: string, storedId?: string) {
  const attrs: Record<string, string> = {};
  const store = new Map<string, string>(storedId ? [["rb_ab_vid", storedId]] : []);
  runInNewContext(experimentBootScript(), {
    document: { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } },
    location: { search },
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) },
    URLSearchParams,
    Math,
    Date,
  });
  return { attrs, store };
}

describe("experimentBootScript", () => {
  it("assigns the same variant as the typed implementation", () => {
    for (const id of ["abc", "visitor-42", "zzz-999"]) {
      expect(runBoot("", id).attrs["data-ab-hero"]).toBe(assignVariant(HERO_EXPERIMENT, id));
    }
  });

  it("persists a new visitor id", () => {
    const { store, attrs } = runBoot("");
    expect(store.get("rb_ab_vid")).toBeTruthy();
    expect(["a", "b"]).toContain(attrs["data-ab-hero"]);
  });

  it("applies the URL override", () => {
    expect(runBoot("?ab_hero=b", "abc").attrs["data-ab-hero"]).toBe("b");
    expect(runBoot("?ab_hero=a", "abc").attrs["data-ab-hero"]).toBe("a");
  });
});

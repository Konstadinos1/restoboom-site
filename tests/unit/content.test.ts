import { describe, expect, it } from "vitest";
import { formatCad, frenchNonBreakingSpaces, HOME } from "@/lib/content";

const BANNED = /puissant|innovant|solution complète|seamless|robust|powerful|innovative|#1|best-in-class|guaranteed|garanti/i;
const STAT = /\b\d{2,3}\s?%|\bx\d+\b|\d+\s?(clients|restaurants|customers)\b/i;

describe("copy deck rules", () => {
  it("FR and EN mirror each other section by section", () => {
    const { fr, en } = HOME;
    expect(en.platform.modules.length).toBe(fr.platform.modules.length);
    expect(en.pains.items.length).toBe(fr.pains.items.length);
    expect(en.faq.items.length).toBe(fr.faq.items.length);
    expect(en.samples.items.length).toBe(fr.samples.items.length);
    expect(en.scene.timeline.map((s) => s.t)).toEqual(fr.scene.timeline.map((s) => s.t));
  });

  it("uses no banned adjectives and no unsourced stats", () => {
    const all = JSON.stringify(HOME);
    expect(all).not.toMatch(BANNED);
    expect(all).not.toMatch(STAT);
  });

  it("keeps meta descriptions within the ~160 char snippet budget", () => {
    for (const c of Object.values(HOME)) expect(c.meta.description.length).toBeLessThanOrEqual(170);
  });
});

describe("formatCad", () => {
  it("uses Quebec French conventions (space thousands, $ after) and en-CA for English", () => {
    expect(formatCad(1299, "fr").replace(/\s/g, " ")).toBe("1 299 $");
    expect(formatCad(1299, "en")).toBe("$1,299");
  });
});


describe("frenchNonBreakingSpaces", () => {
  it("binds ? ! : ; and guillemets to the preceding word", () => {
    expect(frenchNonBreakingSpaces("Où sont mes données ? Oui : « ARRET » !")).toBe("Où sont mes données\u00a0? Oui\u00a0: «\u00a0ARRET\u00a0»\u00a0!");
  });

  it("is applied to every french string, never to english", () => {
    expect(JSON.stringify(HOME.fr)).not.toMatch(/ [?!:;»]/);
    expect(HOME.en.faq.items[0].q).toBe("Does my phone number change?");
  });
});

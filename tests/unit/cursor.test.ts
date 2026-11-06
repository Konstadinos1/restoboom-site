import { describe, expect, it } from "vitest";
import { CURSOR_LABELS, cursorMode, isCursorHint } from "@/lib/cursor";

const plain = { textEntry: false, clickable: false };
const link = { textEntry: false, clickable: true };
const field = { textEntry: true, clickable: true };

describe("HUD cursor", () => {
  it("hides when the pointer has left the window", () => {
    expect(cursorMode(null, undefined)).toBe("hidden");
    expect(cursorMode(null, "explore")).toBe("hidden");
  });

  it("idles over the page and opens up over anything clickable", () => {
    expect(cursorMode(plain, undefined)).toBe("idle");
    expect(cursorMode(link, undefined)).toBe("link");
  });

  it("steps aside over text fields so the caret stays clear", () => {
    expect(cursorMode(field, undefined)).toBe("hidden");
  });

  it("follows the 3D explorer's hint over a cube, and ignores anything else in data-cursor", () => {
    expect(cursorMode(plain, "explore")).toBe("explore");
    expect(cursorMode(plain, "close")).toBe("close");
    expect(cursorMode(link, "pointer")).toBe("link");
    expect(isCursorHint("explore")).toBe(true);
    expect(isCursorHint(undefined)).toBe(false);
  });

  it("labels the explore hints in both languages", () => {
    expect(CURSOR_LABELS.fr).toEqual({ explore: "Explorer", close: "Fermer" });
    expect(CURSOR_LABELS.en).toEqual({ explore: "Explore", close: "Close" });
  });
});

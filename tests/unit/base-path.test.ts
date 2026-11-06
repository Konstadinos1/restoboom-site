import { afterEach, describe, expect, it, vi } from "vitest";
import { isNoIndexBuild, PRODUCTION_BASE_PATH, resolveBasePath } from "@/lib/basePath.mjs";

describe("resolveBasePath", () => {
  it("serves production under /restoboom-site when nothing is set", () => {
    expect(resolveBasePath(undefined)).toBe("/restoboom-site");
    expect(resolveBasePath("")).toBe(PRODUCTION_BASE_PATH);
  });

  it("accepts a pull-request preview path", () => {
    expect(resolveBasePath("/restoboom-site/preview/pr-10")).toBe("/restoboom-site/preview/pr-10");
  });

  it.each([
    ["no leading slash", "restoboom-site"],
    ["trailing slash", "/restoboom-site/"],
    ["space", "/restoboom site"],
    ["parent segment", "/restoboom-site/../main"],
    ["empty segment", "/restoboom-site//preview"],
  ])("refuses a path with a %s", (_label, value) => {
    expect(() => resolveBasePath(value)).toThrow(/Invalid NEXT_PUBLIC_BASE_PATH/);
  });
});

describe("isNoIndexBuild", () => {
  it("only switches on for the exact value 1", () => {
    expect(isNoIndexBuild("1")).toBe(true);
    expect(isNoIndexBuild(undefined)).toBe(false);
    expect(isNoIndexBuild("0")).toBe(false);
    expect(isNoIndexBuild("true")).toBe(false);
  });
});

describe("a preview build", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("serves its own assets but keeps canonical URLs on production, with noindex", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/restoboom-site/preview/pr-10");
    vi.stubEnv("NEXT_PUBLIC_NOINDEX", "1");
    vi.resetModules();
    const site = await import("@/lib/site");
    expect(site.assetPath("/favicon.svg")).toBe("/restoboom-site/preview/pr-10/favicon.svg");
    expect(site.absoluteUrl("/tarifs/")).toBe("https://konstadinos1.github.io/restoboom-site/tarifs/");
    expect(site.NOINDEX).toBe(true);
  });

  it("is indexable and on the production path by default", async () => {
    vi.resetModules();
    const site = await import("@/lib/site");
    expect(site.BASE_PATH).toBe("/restoboom-site");
    expect(site.NOINDEX).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { crystalLayout } from "@/lib/scene/emberCrystal";
import { errorMessage } from "@/components/diagnostic/useLeadSubmission";

describe("crystalLayout", () => {
  it("pushes the crystal off to the right and shrinks it on wide screens (clear of the headline)", () => {
    expect(crystalLayout(16 / 9)).toEqual({ x: 2.8, scale: 0.92 });
  });

  it("uses a mid layout between 1.2 and 1.5 aspect, centred below", () => {
    expect(crystalLayout(1.3)).toEqual({ x: 1.85, scale: 0.8 });
    expect(crystalLayout(1.0)).toEqual({ x: 0, scale: 1 });
  });

  it("treats the 1.5 and 1.2 boundaries as the narrower layout", () => {
    expect(crystalLayout(1.5).x).toBe(1.85);
    expect(crystalLayout(1.2).x).toBe(0);
  });
});

describe("errorMessage", () => {
  it("maps schema codes to localized field messages", () => {
    expect(errorMessage("fr", "phone", "invalid_phone")).toBe("Numéro à 10 chiffres, ex. (514) 555-0123.");
    expect(errorMessage("en", "website_url", "invalid_url")).toBe("Full web address, e.g. https://yourresto.ca");
    expect(errorMessage("en", "email", "invalid_format")).toBe("Please check the email address.");
    expect(errorMessage("fr", "consent", "invalid_value")).toBe("Votre accord est requis pour qu'on vous réponde.");
    expect(errorMessage("fr", "name", "too_small")).toBe("Champ requis.");
  });
});

import { describe, expect, it } from "vitest";
import { errorMessage } from "@/components/diagnostic/useLeadSubmission";

describe("errorMessage", () => {
  it("maps schema codes to localized field messages", () => {
    expect(errorMessage("fr", "phone", "invalid_phone")).toBe("Numéro à 10 chiffres, ex. (514) 555-0123.");
    expect(errorMessage("en", "website_url", "invalid_url")).toBe("Full web address, e.g. https://yourresto.ca");
    expect(errorMessage("en", "email", "invalid_format")).toBe("Please check the email address.");
    expect(errorMessage("fr", "consent", "invalid_value")).toBe("Votre accord est requis pour qu'on vous réponde.");
    expect(errorMessage("fr", "name", "too_small")).toBe("Champ requis.");
  });
});

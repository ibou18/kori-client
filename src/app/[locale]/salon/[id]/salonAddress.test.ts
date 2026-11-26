import { describe, expect, it } from "vitest";
import { formatSalonAddress, isSalonAddressHidden } from "./types";

const full = { street: "1234 rue Saint-Denis", city: "Montréal", postalCode: "H2X 1Y4" };
const masked = { street: "", city: "Montréal", postalCode: "H2X 1Y4" };

describe("formatSalonAddress", () => {
  it("affiche rue et ville quand l'adresse est publique", () => {
    expect(formatSalonAddress(full)).toBe("1234 rue Saint-Denis, Montréal");
  });

  it("affiche ville et code postal quand la rue est masquée", () => {
    expect(formatSalonAddress(masked)).toBe("Montréal, H2X 1Y4");
  });

  it("renvoie une chaîne vide sans adresse", () => {
    expect(formatSalonAddress(null)).toBe("");
  });
});

describe("isSalonAddressHidden", () => {
  it("suit le drapeau du serveur", () => {
    expect(isSalonAddressHidden({ addressHidden: true, address: masked })).toBe(true);
  });

  it("considère l'adresse visible pour le propriétaire (rue renvoyée malgré le réglage)", () => {
    expect(isSalonAddressHidden({ showFullAddress: false, address: full })).toBe(false);
  });

  it("déduit le masquage d'une rue vide si le drapeau manque", () => {
    expect(isSalonAddressHidden({ showFullAddress: false, address: masked })).toBe(true);
  });

  it("adresse publique par défaut", () => {
    expect(isSalonAddressHidden({ address: full })).toBe(false);
    expect(isSalonAddressHidden(null)).toBe(false);
  });
});

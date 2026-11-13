import { describe, expect, it } from "vitest";
import { EMPTY_PRODUCT_FORM, formToPayload, parsePriceToCents } from "./productForm";

describe("formulaire produit", () => {
  it("convertit le prix saisi en centimes", () => {
    expect(parsePriceToCents("24,00")).toBe(2400);
    expect(parsePriceToCents("24.5")).toBe(2450);
    expect(parsePriceToCents("18 $")).toBe(1800);
    expect(parsePriceToCents("0")).toBeNull();
    expect(parsePriceToCents("24,999")).toBeNull();
    expect(parsePriceToCents("abc")).toBeNull();
  });

  it("exige un nom et un prix", () => {
    const result = formToPayload(EMPTY_PRODUCT_FORM);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["name", "price"]);
  });

  it("stock non suivi → null ; suivi → entier", () => {
    const base = { ...EMPTY_PRODUCT_FORM, name: "Huile", price: "24" };
    const untracked = formToPayload(base);
    expect(untracked.ok && untracked.payload.stockQuantity).toBeNull();
    const tracked = formToPayload({ ...base, trackStock: true, stock: "5" });
    expect(tracked.ok && tracked.payload.stockQuantity).toBe(5);
    expect(formToPayload({ ...base, trackStock: true, stock: "-1" }).ok).toBe(false);
  });

  it("vide les champs texte facultatifs en null", () => {
    const result = formToPayload({ ...EMPTY_PRODUCT_FORM, name: " Huile ", price: "24", tip: "  " });
    expect(result.ok && result.payload).toMatchObject({ name: "Huile", tip: null, category: null });
  });
});

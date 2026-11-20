import { describe, expect, it } from "vitest";
import {
  checkProductPhoto,
  EMPTY_PRODUCT_FORM,
  formToPayload,
  parsePriceToCents,
  photoErrorsMessage,
  PRODUCT_PHOTO_MAX_BYTES,
} from "./productForm";

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

describe("checkProductPhoto", () => {
  it("accepte PNG, JPG et WebP jusqu'à 5 Mo", () => {
    expect(checkProductPhoto({ name: "a.png", type: "image/png", size: 1000 })).toBeNull();
    expect(checkProductPhoto({ name: "b.webp", type: "image/webp", size: PRODUCT_PHOTO_MAX_BYTES })).toBeNull();
  });
  it("refuse les autres formats et les fichiers trop lourds", () => {
    expect(checkProductPhoto({ name: "c.gif", type: "image/gif", size: 10 })).toContain("format");
    expect(checkProductPhoto({ name: "d.jpg", type: "image/jpeg", size: PRODUCT_PHOTO_MAX_BYTES + 1 })).toContain("5 Mo");
  });
});

describe("photoErrorsMessage", () => {
  it("ne dit rien quand toutes les photos sont passées", () => {
    expect(photoErrorsMessage([])).toBeNull();
  });
  it("dit que le produit est enregistré et liste les photos refusées", () => {
    const one = photoErrorsMessage([{ fileName: "a.jpg", message: "Photo trop volumineuse (5 Mo maximum)" }]);
    expect(one).toMatch(/^Produit enregistré, mais une photo/);
    expect(one).toContain("a.jpg");
    const two = photoErrorsMessage([
      { fileName: "a.jpg", message: "x" },
      { fileName: "b.png", message: "y" },
    ]);
    expect(two).toContain("2 photos");
  });
});

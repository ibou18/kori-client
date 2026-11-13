import { describe, expect, it } from "vitest";
import { checkSalonPhotoFile } from "./SalonPhotosManager";

describe("checkSalonPhotoFile", () => {
  it("accepte PNG, JPG et WebP jusqu'à 10 Mo", () => {
    expect(checkSalonPhotoFile({ type: "image/jpeg", size: 10 * 1024 * 1024 })).toBeNull();
    expect(checkSalonPhotoFile({ type: "image/png", size: 1 })).toBeNull();
    expect(checkSalonPhotoFile({ type: "image/webp", size: 1 })).toBeNull();
  });
  it("refuse les autres formats et les fichiers trop lourds", () => {
    expect(checkSalonPhotoFile({ type: "image/heic", size: 1 })).toMatch(/Format/);
    expect(checkSalonPhotoFile({ type: "image/jpeg", size: 10 * 1024 * 1024 + 1 })).toMatch(/10 Mo/);
  });
});

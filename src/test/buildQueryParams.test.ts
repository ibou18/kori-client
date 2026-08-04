/**
 * Tests unitaires — construction de query string URL
 * Couvre : filtrage valeurs vides, dates ISO, tableaux `key[]`, objets JSON.
 */
import { describe, expect, it } from "vitest";
import { buildQueryParams } from "../utils/buildQueryParams";

describe("buildQueryParams", () => {
  it("returns an empty string without valid params", () => {
    expect(buildQueryParams({})).toBe("");
    expect(buildQueryParams({ a: null, b: undefined, c: "" })).toBe("");
  });

  it("serializes strings, numbers and booleans", () => {
    expect(buildQueryParams({ q: "cut", page: 2, active: true })).toBe(
      "?q=cut&page=2&active=true",
    );
  });

  it("serializes dates as ISO", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    expect(buildQueryParams({ from: date })).toBe(
      `?from=${encodeURIComponent(date.toISOString())}`,
    );
  });

  it("serializes arrays with key[]", () => {
    expect(buildQueryParams({ status: ["PENDING", "PAID"] })).toBe(
      "?status%5B%5D=PENDING&status%5B%5D=PAID",
    );
  });

  it("serializes objects as JSON", () => {
    expect(buildQueryParams({ filter: { a: 1 } })).toBe(
      `?filter=${encodeURIComponent(JSON.stringify({ a: 1 }))}`,
    );
  });
});

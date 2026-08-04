/**
 * Tests unitaires — agrégation mensuelle des comptes (charts dashboard)
 * Groupe par mois, incrémente le total (+1), tri chronologique.
 */
import { describe, expect, it } from "vitest";
import { countSort } from "./countSort";

describe("countSort", () => {
  it("counts items by month and sorts chronologically", () => {
    const result = countSort(
      [
        { createdAt: "2024-02-10T10:00:00.000Z" },
        { createdAt: "2024-01-05T10:00:00.000Z" },
        { createdAt: "2024-01-20T10:00:00.000Z" },
      ],
      "createdAt",
    );

    expect(result).toHaveLength(2);
    expect(result[0].total).toBe(2);
    expect(result[1].total).toBe(1);
    expect(result[0].timestamp).toBeLessThan(result[1].timestamp);
  });
});

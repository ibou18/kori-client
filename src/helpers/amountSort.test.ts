/**
 * Tests unitaires — agrégation mensuelle des montants (charts dashboard)
 * Groupe par mois, somme valueKey, tri chronologique.
 */
import { describe, expect, it } from "vitest";
import { amountSort } from "./amountSort";

describe("amountSort", () => {
  it("aggregates amounts by month and sorts chronologically", () => {
    const result = amountSort(
      [
        { createdAt: "2024-03-10T10:00:00.000Z", amount: 20 },
        { createdAt: "2024-01-05T10:00:00.000Z", amount: 10 },
        { createdAt: "2024-01-20T10:00:00.000Z", amount: 5 },
      ],
      "createdAt",
      "amount",
    );

    expect(result).toHaveLength(2);
    expect(result[0].total).toBe(15);
    expect(result[1].total).toBe(20);
    expect(result[0].timestamp).toBeLessThan(result[1].timestamp);
    expect(result[0].date).toMatch(/-2024$/);
  });
});

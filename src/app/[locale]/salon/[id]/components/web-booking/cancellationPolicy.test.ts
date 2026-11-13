import { describe, expect, it } from "vitest";
import { cancellationPolicyText, formatNotice } from "./cancellationPolicy";

const salon = (noticeHours: number, lateRefundPercent: number) => ({
  source: "SALON" as const,
  noticeHours,
  lateRefundPercent,
  feeRefundNoticeHours: 24,
});

describe("formatNotice", () => {
  it("heures, puis jours entiers à partir de 48 h", () => {
    expect(formatNotice(12)).toBe("12 h");
    expect(formatNotice(24)).toBe("24 h");
    expect(formatNotice(36)).toBe("36 h");
    expect(formatNotice(48)).toBe("2 jours");
    expect(formatNotice(72)).toBe("3 jours");
  });
});

describe("cancellationPolicyText", () => {
  it("politique du salon avec remboursement partiel", () => {
    expect(cancellationPolicyText(salon(48, 50), true)).toBe(
      "Politique du salon : acompte remboursé si vous annulez plus de 2 jours avant le rendez-vous ; ensuite, 50 % de l'acompte est remboursé. Frais de service remboursés jusqu'à 24 h avant.",
    );
  });
  it("0 % : acompte non remboursé après le délai", () => {
    expect(cancellationPolicyText(salon(24, 0), true)).toContain("ensuite, l'acompte n'est pas remboursé");
  });
  it("règle Kori quand le salon n'a pas de politique", () => {
    expect(cancellationPolicyText({ ...salon(24, 0), source: "KORI" }, true)).toContain("l'acompte reste au salon");
  });
  it("sans acompte, la politique du salon est sans objet", () => {
    expect(cancellationPolicyText(salon(48, 50), false)).toBe(
      "Annulation gratuite jusqu'à 24 h avant le rendez-vous. Ensuite, les frais de service ne sont pas remboursés.",
    );
  });
});

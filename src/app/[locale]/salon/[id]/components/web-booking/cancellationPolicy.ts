/** Politique d'annulation renvoyée par POST /payments/quote (kori-server docs/CANCELLATION_POLICY.md). */
export interface QuoteCancellationPolicy {
  source: "SALON" | "KORI";
  noticeHours: number;
  lateRefundPercent: number;
  feeRefundNoticeHours: number;
}

/** « 24 h », « 2 jours » (jours entiers à partir de 48 h). */
export function formatNotice(hours: number): string {
  if (hours >= 48 && hours % 24 === 0) return `${hours / 24} jours`;
  return `${hours} h`;
}

/**
 * Phrase courte affichée sous le titre « Paiement ». La politique du salon ne porte que
 * sur l'acompte : sans acompte, ou sans politique, c'est la règle Kori.
 */
export function cancellationPolicyText(policy: QuoteCancellationPolicy | undefined, hasDeposit: boolean): string {
  const feeNotice = formatNotice(policy?.feeRefundNoticeHours ?? 24);
  if (!hasDeposit) {
    return `Annulation gratuite jusqu'à ${feeNotice} avant le rendez-vous. Ensuite, les frais de service ne sont pas remboursés.`;
  }
  if (!policy || policy.source === "KORI") {
    return `Annulation jusqu'à ${feeNotice} avant : frais de service remboursés, l'acompte reste au salon. Ensuite, aucun remboursement.`;
  }
  const notice = formatNotice(policy.noticeHours);
  const late =
    policy.lateRefundPercent >= 100
      ? "l'acompte reste remboursé en entier"
      : policy.lateRefundPercent > 0
        ? `${policy.lateRefundPercent} % de l'acompte est remboursé`
        : "l'acompte n'est pas remboursé";
  return `Politique du salon : acompte remboursé si vous annulez plus de ${notice} avant le rendez-vous ; ensuite, ${late}. Frais de service remboursés jusqu'à ${feeNotice} avant.`;
}

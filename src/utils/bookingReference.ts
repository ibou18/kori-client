/**
 * Référence courte d'un rendez-vous : les 5 derniers caractères de son id.
 * Aligné sur kori-mobile/utils/bookingReference.ts — repli en attendant la
 * colonne `reference` (roadmap K3F7A).
 */
export const getShortReference = (id?: string | null): string => {
  if (!id) return "";
  return id.slice(-5).toUpperCase();
};

/** Version préfixée, prête à afficher : `#A1B2C`. */
export const formatShortReference = (id?: string | null): string => {
  const ref = getShortReference(id);
  return ref ? `#${ref}` : "";
};

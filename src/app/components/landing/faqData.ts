/**
 * Questions fréquentes de la landing.
 * Module sans « use client » : réutilisé côté serveur pour le JSON-LD FAQPage,
 * qui doit refléter exactement le contenu visible.
 */
export const LANDING_FAQS = [
  {
    question: "korí est-il vraiment gratuit pour les professionnels ?",
    answer:
      "Oui. Aucun abonnement, aucun frais d'inscription, aucun engagement et aucune carte bancaire demandée. Vous créez votre salon et commencez à recevoir des réservations sans rien payer.",
  },
  {
    question: "Comment réserver une prestation ?",
    answer:
      "Téléchargez l'app, trouvez un pro près de chez vous, choisissez la prestation et le créneau, puis confirmez. Vous recevez une confirmation immédiate et un rappel avant le rendez-vous.",
  },
  {
    question: "Les paiements sont-ils sécurisés ?",
    answer:
      "Oui. L'acompte versé à la réservation passe par Stripe. Vos informations bancaires ne sont jamais stockées par korí.",
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer:
      "Oui, depuis l'app, selon la politique d'annulation du prestataire. Les conditions sont affichées avant de confirmer.",
  },
  {
    question: "Je suis coiffeuse à domicile, puis-je m'inscrire ?",
    answer:
      "Bien sûr. korí accueille les salons comme les indépendants : à domicile, en studio ou en déplacement. Vous paramétrez vos lieux de prestation.",
  },
  {
    question: "korí est-il disponible dans ma région ?",
    answer:
      "korí se développe progressivement au Canada. Ouvrez l'app pour voir les prestataires disponibles autour de vous.",
  },
];

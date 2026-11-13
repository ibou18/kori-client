import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CGVPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="max-w-6xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Conditions Générales de Vente (CGV)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold">1. Objet</h2>
            <p>
              Les présentes conditions générales régissent la vente des services
              proposés par Kori via la plateforme mobile et web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Tarifs et Paiement</h2>
            <p>
              Les prix des services sont indiqués en dollars canadiens (CAD) et
              sont sujets à des mises à jour. Chaque réservation comprend deux
              composantes distinctes :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>
                <strong>Acompte (15%) :</strong> Versé directement au
                prestataire pour garantir la réservation. Cet acompte n'est pas
                perçu par Kori et n'est pas soumis à la TVH/TVQ.
              </li>
              <li>
                <strong>Frais de réservation (6%) :</strong> Perçus par Kori
                pour l'utilisation de la plateforme, couvrant la gestion du
                système, le support client et la maintenance technique. Ces
                frais sont assujettis aux taxes applicables (TVH 5% + TVQ
                9,975%).
              </li>
            </ul>
            <p className="mt-3">
              Le solde de la prestation (79%) est payé directement au
              prestataire le jour du rendez-vous selon ses modalités. Kori
              n'intervient pas dans cette transaction finale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Accès aux Services</h2>
            <p>
              L'accès aux services est immédiat après inscription. L'utilisateur
              peut gérer son compte et utiliser les services selon ses besoins.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. Annulation et Remboursement
            </h2>
            <p>
              Les services sont payés à la prestation. Les remboursements suivent
              les règles ci-dessous. La politique applicable à une réservation
              est affichée en tête de l&apos;écran de paiement et reste celle en
              vigueur au moment de la réservation, même si le salon la modifie
              ensuite.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>
                <strong>Politique d&apos;annulation du salon :</strong> chaque
                salon peut définir sa propre politique pour l&apos;acompte, avec
                deux paramètres : un délai avant le rendez-vous (de 1 heure à 7
                jours) et un pourcentage de l&apos;acompte remboursé si le client
                annule après ce délai. Si le client annule avant le délai,
                l&apos;acompte est remboursé en entier. S&apos;il annule après,
                il est remboursé selon le pourcentage choisi par le salon ; un
                pourcentage de 0 % signifie qu&apos;aucun remboursement de
                l&apos;acompte n&apos;est accordé.
              </li>
              <li>
                <strong>Salon sans politique propre :</strong> si le client
                annule au moins 24 h avant le rendez-vous, les frais de
                réservation sont remboursés et l&apos;acompte reste acquis au
                salon ; en deçà de 24 h, aucun remboursement n&apos;est accordé.
              </li>
              <li>
                <strong>Frais de réservation Kori :</strong> remboursés si
                l&apos;annulation par le client est effectuée au moins 24 h avant
                la date et l&apos;heure du rendez-vous, quelle que soit la
                politique du salon.
              </li>
              <li>
                <strong>Réservation sans acompte :</strong> remboursement
                intégral du montant payé en ligne si l&apos;annulation est
                effectuée au moins 24 h avant le rendez-vous.
              </li>
              <li>
                <strong>Produits achetés avec la réservation :</strong>
                remboursés en entier en cas d&apos;annulation.
              </li>
              <li>
                <strong>Annulation par le salon :</strong> Remboursement
                intégral de la totalité du montant payé.
              </li>
              <li>
                <strong>Service rendu :</strong> Aucun remboursement n&apos;est
                accordé une fois le service effectué.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Responsabilité</h2>
            <p>
              Kori ne pourra être tenu responsable en cas de force majeure
              empêchant l'accès ou le bon fonctionnement de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Révision des Tarifs</h2>
            <p>
              Kori se réserve le droit de modifier les pourcentages de frais de
              réservation et d'acompte moyennant un préavis de 30 jours
              communiqué aux utilisateurs. Toute modification prendra effet
              uniquement pour les réservations effectuées après la date d'entrée
              en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              7. Transparence et Affichage
            </h2>
            <p>
              Tous les montants (acompte, frais de réservation et taxes) sont
              clairement affichés avant la confirmation de la réservation.
              L'utilisateur reçoit un reçu détaillé par courriel à chaque
              transaction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Modification des CGV</h2>
            <p>
              Kori se réserve le droit de modifier ces conditions. Les
              utilisateurs en seront informés par e-mail ou notification.
            </p>
          </section>

          <p className="text-sm text-gray-500">
            Dernière mise à jour : 13 novembre 2026
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

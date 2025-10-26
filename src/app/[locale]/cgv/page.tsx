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
              Les services sont payés à la prestation. Les remboursements sont
              autorisés dans les cas suivants :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Annulation par le client :</strong> Remboursement
                intégral si l&apos;annulation est effectuée au moins 24h avant
                la date et l&apos;heure du rendez-vous.
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
            Dernière mise à jour : 26 Octobre 2025
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

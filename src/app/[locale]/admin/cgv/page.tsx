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
              proposés par Solutions 3R via la plateforme tax514.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Tarifs et Paiement</h2>
            <p>
              Les prix de nos abonnements sont indiqués en dollars canadiens
              (CAD) et sont sujets à des mises à jour. Les paiements sont gérés
              via Stripe et sont facturés mensuellement ou annuellement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Accès aux Services</h2>
            <p>
              Après souscription, l’accès aux services est immédiat. L’abonné
              peut gérer son compte et annuler son abonnement à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. Annulation et Remboursement
            </h2>
            <p>
              Les abonnements sont sans engagement. Aucun remboursement
              n&apos;est accordé une fois la période en cours commencée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Responsabilité</h2>
            <p>
              Solutions 3R ne pourra être tenu responsable en cas de force
              majeure empêchant l’accès ou le bon fonctionnement de la
              plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Modification des CGV</h2>
            <p>
              Solutions 3R se réserve le droit de modifier ces conditions. Les
              utilisateurs en seront informés par e-mail ou notification.
            </p>
          </section>

          <p className="text-sm text-gray-500">
            Dernière mise à jour : 03 Mars 2025
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

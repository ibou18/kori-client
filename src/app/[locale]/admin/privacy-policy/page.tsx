import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-0 py-10">
      <Card className="max-w-6xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Politique de Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold">1. Collecte des Données</h2>
            <p>
              Nous collectons des informations personnelles telles que le nom,
              l’adresse e-mail et les informations de paiement nécessaires à la
              gestion des abonnements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              2. Utilisation des Données
            </h2>
            <p>
              Les données sont utilisées exclusivement pour le bon
              fonctionnement des services et ne sont jamais revendues à des
              tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Sécurité des Données</h2>
            <p>
              Nous mettons en place des mesures de sécurité avancées pour
              protéger les informations personnelles de nos utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. Stockage et Conservation
            </h2>
            <p>
              Les données sont conservées aussi longtemps que l’abonnement est
              actif et sont supprimées sur demande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              5. Droits des Utilisateurs
            </h2>
            <p>
              Vous avez le droit d’accéder, de modifier ou de supprimer vos
              données personnelles à tout moment en nous contactant à
              contact@solutions3r.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Cookies</h2>
            <p>
              Notre site utilise des cookies pour améliorer l’expérience
              utilisateur. Vous pouvez modifier vos préférences à tout moment.
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

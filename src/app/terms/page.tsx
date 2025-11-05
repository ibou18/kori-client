"use client";
import { Divider, Layout, Typography } from "antd";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

export default function TermsAndConditions() {
  // TODO: Add the terms and conditions for the platform
  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "auto" }}>
      <Content>
        <Typography>
          <Title level={2}>Conditions Générales de Vente</Title>

          <Divider />

          <Title level={3}>1. Objet</Title>
          <Paragraph>
            Les présentes conditions générales de vente (CGV) régissent
            l&apos;ensemble des transactions réalisées sur la plateforme Kori,
            service de mise en relation pour des prestations du quotidien. En
            accédant à notre service, l&apos;utilisateur accepte ces conditions
            sans réserve.
          </Paragraph>

          <Title level={3}>2. Accès au Service</Title>
          <Paragraph>
            L&apos;accès à la plateforme Kori est ouvert à tous les utilisateurs
            majeurs disposant d&apos;un compte actif. Les utilisateurs peuvent
            réserver des prestations ou proposer leurs services selon leurs
            besoins et disponibilités.
          </Paragraph>

          <Title level={3}>3. Création et Utilisation d'un Compte</Title>
          <Paragraph>
            Pour utiliser la plateforme Kori, l&apos;utilisateur doit créer un
            compte en fournissant des informations exactes et à jour.
            L&apos;utilisateur est responsable de la protection de ses
            informations de connexion et de toutes les activités réalisées sous
            son compte, y compris les réservations et les prestations proposées.
          </Paragraph>

          <Title level={3}>4. Tarification et Paiement</Title>
          <Paragraph>
            Les tarifs des prestations sont clairement indiqués par chaque
            prestataire sur la plateforme. Le paiement s&apos;effectue via
            Stripe au moment de la réservation. Les prix sont affichés en
            dollars canadiens (CAD) et incluent les frais de service de la
            plateforme.
          </Paragraph>

          <Title level={3}>5. Réservations et Annulations</Title>
          <Paragraph>
            Les réservations sont effectuées en ligne et confirmées par e-mail.
            L&apos;utilisateur peut annuler sa réservation au moins 24h avant le
            rendez-vous pour obtenir un remboursement intégral. En cas
            d&apos;annulation par le prestataire, le remboursement est
            automatique. Toute utilisation abusive de la plateforme entraînera
            la suspension du compte.
          </Paragraph>

          <Title level={3}>6. Politique de Remboursement</Title>
          <Paragraph>
            Les remboursements sont accordés dans les cas suivants :
            <ul>
              <li>
                Annulation par le client au moins 24h avant le rendez-vous
              </li>
              <li>Annulation par le prestataire</li>
              <li>Erreur technique de la plateforme</li>
            </ul>
            Aucun remboursement n&apos;est accordé une fois la prestation
            effectuée.
          </Paragraph>

          <Title level={3}>7. Responsabilité</Title>
          <Paragraph>
            Kori agit comme intermédiaire entre les utilisateurs et les
            prestataires. Notre responsabilité se limite à la mise en relation
            et au traitement des paiements. Les prestataires sont responsables
            de la qualité de leurs services et de leur conformité légale.
            L&apos;utilisateur est responsable de ses réservations et de leur
            utilisation.
          </Paragraph>

          <Title level={3}>8. Protection des Données</Title>
          <Paragraph>
            Les données des utilisateurs sont traitées conformément à notre
            politique de confidentialité et aux réglementations en vigueur. Les
            informations personnelles et de paiement sont sécurisées.
            L&apos;utilisateur a le droit de demander l&apos;accès, la
            modification ou la suppression de ses données personnelles.
          </Paragraph>

          <Title level={3}>9. Modifications des CGV</Title>
          <Paragraph>
            Kori se réserve le droit de modifier les présentes CGV à tout
            moment. Les modifications seront publiées sur la plateforme et les
            utilisateurs en seront informés par e-mail ou notification. Les
            nouvelles conditions s&apos;appliquent immédiatement aux nouvelles
            réservations.
          </Paragraph>

          <Title level={3}>10. Contact</Title>
          <Paragraph>
            Pour toute question ou réclamation, veuillez contacter notre support
            client à{" "}
            <Text strong>
              <Link href={`mailto:${process.env.EMAIL_CONTACT}`}>
                {process.env.EMAIL_CONTACT}
              </Link>
            </Text>
            .
          </Paragraph>

          <Divider />

          <Paragraph>
            En utilisant la plateforme Kori, vous acceptez pleinement les
            présentes Conditions Générales de Vente.
          </Paragraph>
        </Typography>
      </Content>
    </div>
  );
}

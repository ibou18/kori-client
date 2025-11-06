"use client";
import { LOGO_BLACK } from "@/shared/constantes";
import { Divider, Layout, Typography } from "antd";
import { motion } from "framer-motion";
import Image from "next/image";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

/**
 * Conditions générales d'utilisation - Clients – Kori (version client)
 */
export default function CGUClient(): JSX.Element {
  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "auto" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        className="flex justify-center items-center"
      >
        <Image
          src={LOGO_BLACK}
          width={800}
          height={500}
          alt="Kori"
          className="inset-0 text-center mx-auto m-8 h-[200px] w-[500px] object-contain"
        />
      </motion.div>

      <Content>
        <Typography>
          <Title level={2}>
            Conditions générales d&apos;utilisation - Clients
          </Title>
          <Paragraph italic type="secondary" style={{ textAlign: "center" }}>
            Dernière mise à jour : 1er novembre 2025
          </Paragraph>

          <Divider />

          <Title level={3}>1. Objet</Title>
          <Paragraph>
            Les présentes conditions générales d&apos;utilisation (les «
            Conditions ») régissent la relation entre Korí Beauty Inc. (« Korí
            ») et les utilisateurs clients (« vous », « client ») utilisant la
            plateforme Korí pour réserver et bénéficier de services de beauté.
          </Paragraph>

          <Title level={3}>2. Inscription et éligibilité</Title>
          <Paragraph>
            Pour utiliser la plateforme Korí, vous devez créer un compte,
            fournir des informations exactes et à jour (y compris vos
            coordonnées) et être âgé d&apos;au moins 18 ans. Vous êtes
            responsable de la confidentialité de vos identifiants de connexion.
          </Paragraph>

          <Title level={3}>3. Utilisation de la plateforme</Title>
          <Paragraph>
            Korí est une plateforme de mise en relation qui vous permet de
            découvrir, réserver et payer des services de beauté auprès de
            prestataires indépendants.
            <br />
            <br />
            Korí agit uniquement comme intermédiaire technologique et n&apos;est
            pas partie au contrat de service entre vous et le prestataire.
          </Paragraph>

          <Title level={3}>4. Réservations et paiements</Title>
          <Paragraph>
            Lors de la réservation d&apos;un service, vous acceptez de payer :
            <ul>
              <li>
                Un acompte de 15% du montant du service pour confirmer la
                réservation
              </li>
              <li>
                Des frais de réservation de 6% du montant total, payés à Korí
              </li>
              <li>
                Le solde restant directement au prestataire lors du rendez-vous
              </li>
            </ul>
            Les paiements sont sécurisés via Stripe. Les prix sont affichés en
            dollars canadiens (CAD) et incluent les taxes applicables.
          </Paragraph>

          <Title level={3}>5. Annulations et remboursements</Title>
          <Paragraph>
            Les politiques d&apos;annulation sont définies dans notre politique
            d&apos;annulation dédiée. En général :
            <ul>
              <li>
                Annulation plus de 24h à l&apos;avance : remboursement intégral
                de l&apos;acompte
              </li>
              <li>
                Annulation moins de 24h à l&apos;avance : 100% de l&apos;acompte
                est retenu
              </li>
              <li>
                En cas d&apos;annulation par le prestataire : remboursement
                intégral immédiat
              </li>
            </ul>
          </Paragraph>

          <Title level={3}>6. Obligations du client</Title>
          <Paragraph>
            En tant que client, vous vous engagez à :
            <ul>
              <li>
                Respecter les rendez-vous confirmés ou annuler dans les délais
                prévus
              </li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Respecter les prestataires et leur travail</li>
              <li>
                Ne pas utiliser la plateforme à des fins illégales ou
                frauduleuses
              </li>
              <li>Payer les services réservés selon les modalités convenues</li>
            </ul>
          </Paragraph>

          <Title level={3}>7. Responsabilités de Korí</Title>
          <Paragraph>
            Korí agit comme intermédiaire technologique et n&apos;est pas partie
            au contrat de service entre vous et le prestataire.
            <br />
            <br />
            Korí ne garantit pas la qualité des services fournis par les
            prestataires, mais s&apos;efforce de maintenir un niveau élevé de
            professionnalisme sur la plateforme.
          </Paragraph>

          <Title level={3}>8. Avis et évaluations</Title>
          <Paragraph>
            Vous pouvez laisser des avis et évaluations sur les services reçus.
            Ces avis doivent être honnêtes, respectueux et conformes à la
            réalité de votre expérience. Korí se réserve le droit de modérer ou
            supprimer tout contenu inapproprié.
          </Paragraph>

          <Title level={3}>9. Suspension ou résiliation</Title>
          <Paragraph>
            Korí se réserve le droit de suspendre ou de supprimer tout compte
            client en cas de non-respect de ces Conditions, de comportement
            inapproprié, de fraude ou d&apos;utilisation abusive de la
            plateforme.
          </Paragraph>

          <Title level={3}>10. Droit applicable</Title>
          <Paragraph>
            Ces Conditions sont régies par les lois du Québec et les lois
            fédérales du Canada applicables.
          </Paragraph>

          <Divider />

          <Title level={3}>CLIENT TERMS OF SERVICE</Title>

          <Title level={4}>1. Purpose</Title>
          <Paragraph>
            These Client Terms of Service (&quot;Terms&quot;) govern the
            relationship between Korí Beauty Inc. (&quot;Korí&quot;) and users
            (&quot;you&quot;, &quot;client&quot;) using the Korí platform to
            book and receive beauty services.
          </Paragraph>

          <Title level={4}>2. Registration and Eligibility</Title>
          <Paragraph>
            To use the Korí platform, you must create an account, provide
            accurate and up-to-date information (including contact details), and
            be at least 18 years old. You are responsible for maintaining the
            confidentiality of your login credentials.
          </Paragraph>

          <Title level={4}>3. Use of the Platform</Title>
          <Paragraph>
            Korí is a connection platform that allows you to discover, book, and
            pay for beauty services from independent providers.
            <br />
            <br />
            Korí acts solely as a technological intermediary and is not a party
            to the service contract between you and the provider.
          </Paragraph>

          <Title level={4}>4. Bookings and Payments</Title>
          <Paragraph>
            When booking a service, you agree to pay:
            <ul>
              <li>
                A deposit of 15% of the service amount to confirm the booking
              </li>
              <li>A reservation fee of 6% of the total amount, paid to Korí</li>
              <li>
                The remaining balance directly to the provider during the
                appointment
              </li>
            </ul>
            Payments are secured via Stripe. Prices are displayed in Canadian
            dollars (CAD) and include applicable taxes.
          </Paragraph>

          <Title level={4}>5. Cancellations and Refunds</Title>
          <Paragraph>
            Cancellation policies are defined in our dedicated cancellation
            policy. In general:
            <ul>
              <li>
                Cancellation more than 24h in advance: full deposit refund
              </li>
              <li>
                Cancellation less than 24h in advance: 100% of deposit is
                retained
              </li>
              <li>If canceled by the provider: immediate full refund</li>
            </ul>
          </Paragraph>

          <Title level={4}>6. Client Obligations</Title>
          <Paragraph>
            As a client, you agree to:
            <ul>
              <li>
                Honor confirmed appointments or cancel within the specified
                timeframes
              </li>
              <li>Provide accurate and up-to-date information</li>
              <li>Respect providers and their work</li>
              <li>Not use the platform for illegal or fraudulent purposes</li>
              <li>Pay for booked services according to the agreed terms</li>
            </ul>
          </Paragraph>

          <Title level={4}>7. Korí&apos;s Responsibilities</Title>
          <Paragraph>
            Korí acts as a technological intermediary and is not a party to the
            service contract between you and the provider.
            <br />
            <br />
            Korí does not guarantee the quality of services provided by
            providers, but strives to maintain a high level of professionalism
            on the platform.
          </Paragraph>

          <Title level={4}>8. Reviews and Ratings</Title>
          <Paragraph>
            You may leave reviews and ratings on services received. These
            reviews must be honest, respectful, and reflect the reality of your
            experience. Korí reserves the right to moderate or remove any
            inappropriate content.
          </Paragraph>

          <Title level={4}>9. Suspension or Termination</Title>
          <Paragraph>
            Korí reserves the right to suspend or delete any client account in
            case of violation of these Terms, inappropriate behavior, fraud, or
            misuse of the platform.
          </Paragraph>

          <Title level={4}>10. Governing Law</Title>
          <Paragraph>
            These Terms are governed by the laws of the Province of Quebec and
            the applicable federal laws of Canada.
          </Paragraph>

          <Divider />

          <Paragraph italic>
            En utilisant la plateforme Korí en tant que client, vous acceptez
            ces conditions générales d&apos;utilisation.
            <br />
            <br />
            By using the Korí platform as a client, you agree to these Terms of
            Service.
          </Paragraph>
        </Typography>
      </Content>
    </div>
  );
}

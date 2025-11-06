"use client";
import { LOGO_BLACK } from "@/shared/constantes";
import { Divider, Layout, Typography } from "antd";
import { motion } from "framer-motion";
import Image from "next/image";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

/**
 * Conditions de service - Prestataires – Kori (version client)
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
          <Title level={2}>Conditions de service - Prestataires</Title>
          <Paragraph italic type="secondary" style={{ textAlign: "center" }}>
            Dernière mise à jour : 1er novembre 2025
          </Paragraph>

          <Divider />

          <Title level={3}>1. Objet</Title>
          <Paragraph>
            Les présentes conditions de service (les « Conditions ») régissent
            la relation entre Korí Beauty Inc. (« Korí ») et les prestataires de
            services de beauté (« vous », « prestataire ») utilisant la
            plateforme Korí pour offrir leurs services.
          </Paragraph>

          <Title level={3}>2. Inscription et éligibilité</Title>
          <Paragraph>
            Pour offrir des services sur Korí, vous devez créer un compte
            professionnel, fournir des informations exactes (y compris vos
            coordonnées et votre zone de service) et respecter les lois
            applicables à votre activité.
          </Paragraph>

          <Title level={3}>3. Utilisation de la plateforme</Title>
          <Paragraph>
            Korí fournit un outil technologique permettant aux prestataires
            d&apos;être visibles et de gérer leurs rendez-vous.
            <br />
            <br />
            Les prestataires demeurent indépendants et responsables de la
            prestation de leurs services.
          </Paragraph>

          <Title level={3}>4. Modèle économique et paiements</Title>
          <Paragraph>
            Korí perçoit des frais de réservation (6 % du montant total) payés
            par le client, ainsi qu&apos;un acompte de 15 % du montant de la
            prestation, reversé au prestataire pour confirmer la réservation.
            <br />
            <br />
            Le solde est payé directement au prestataire lors du rendez-vous.
            <br />
            <br />
            La première année, Korí est gratuite pour les prestataires. Ensuite,
            un modèle freemium/premium sera introduit.
          </Paragraph>

          <Title level={3}>5. Annulations et remboursements</Title>
          <Paragraph>
            En cas d&apos;annulation d&apos;un rendez-vous, le prestataire doit
            informer le client dès que possible. Les politiques
            d&apos;annulation sont définies par chaque prestataire, mais doivent
            être raisonnables et transparentes.
          </Paragraph>

          <Title level={3}>6. Obligations du prestataire</Title>
          <Paragraph>
            Le prestataire s&apos;engage à :
            <ul>
              <li>Fournir des services professionnels et sécuritaires.</li>
              <li>
                Respecter les horaires et les engagements pris envers les
                clients.
              </li>
              <li>
                Ne pas utiliser la plateforme à des fins illégales ou
                trompeuses.
              </li>
              <li>
                Maintenir à jour son profil et ses informations de service.
              </li>
            </ul>
          </Paragraph>

          <Title level={3}>7. Responsabilités de Korí</Title>
          <Paragraph>
            Korí agit comme intermédiaire technologique et n&apos;est pas partie
            au contrat de service entre le prestataire et le client.
            <br />
            <br />
            Korí ne garantit pas le nombre de réservations ni la performance du
            prestataire.
          </Paragraph>

          <Title level={3}>8. Propriété intellectuelle</Title>
          <Paragraph>
            Les prestataires conservent la propriété de leur contenu (photos,
            descriptions, etc.) mais accordent à Korí une licence non exclusive
            pour l&apos;afficher sur la plateforme.
          </Paragraph>

          <Title level={3}>9. Suspension ou résiliation</Title>
          <Paragraph>
            Korí se réserve le droit de suspendre ou de supprimer tout compte
            prestataire en cas de non-respect de ces Conditions ou de
            comportement inapproprié.
          </Paragraph>

          <Title level={3}>10. Droit applicable</Title>
          <Paragraph>
            Ces Conditions sont régies par les lois du Québec et les lois
            fédérales du Canada applicables.
          </Paragraph>

          <Divider />

          <Title level={3}>SERVICE PROVIDER AGREEMENT</Title>

          <Title level={4}>1. Purpose</Title>
          <Paragraph>
            These Service Provider Terms (&quot;Terms&quot;) govern the
            relationship between Korí Beauty Inc. (&quot;Korí&quot;) and beauty
            professionals (&quot;you&quot;, &quot;provider&quot;) using the Korí
            platform to offer their services.
          </Paragraph>

          <Title level={4}>2. Registration and Eligibility</Title>
          <Paragraph>
            To offer services on Korí, you must create a professional account,
            provide accurate information (including contact details and service
            area), and comply with all applicable laws.
          </Paragraph>

          <Title level={4}>3. Use of the Platform</Title>
          <Paragraph>
            Korí provides a technological tool that allows providers to gain
            visibility and manage bookings.
            <br />
            <br />
            Providers remain independent and are solely responsible for
            delivering their services.
          </Paragraph>

          <Title level={4}>4. Business Model and Payments</Title>
          <Paragraph>
            Korí collects a reservation fee (6% of the total amount) paid by the
            client, and a deposit of 15% of the service price, transferred to
            the provider to confirm the booking.
            <br />
            <br />
            The remaining balance is paid directly to the provider during the
            appointment.
            <br />
            <br />
            During the first year, Korí is free for providers. Afterward, a
            freemium/premium model will apply.
          </Paragraph>

          <Title level={4}>5. Cancellations and Refunds</Title>
          <Paragraph>
            If a booking must be canceled, the provider must inform the client
            as soon as possible.
            <br />
            <br />
            Each provider defines their own cancellation policy, which must be
            reasonable and transparent.
          </Paragraph>

          <Title level={4}>6. Provider Obligations</Title>
          <Paragraph>
            The provider agrees to:
            <ul>
              <li>Deliver professional and safe services.</li>
              <li>Honor appointments and commitments with clients.</li>
              <li>Not use the platform for illegal or misleading purposes.</li>
              <li>Keep their profile and service information up to date.</li>
            </ul>
          </Paragraph>

          <Title level={4}>7. Korí&apos;s Responsibilities</Title>
          <Paragraph>
            Korí acts solely as a technological intermediary and is not a party
            to the service contract between the provider and the client.
            <br />
            <br />
            Korí does not guarantee booking volume or provider performance.
          </Paragraph>

          <Title level={4}>8. Intellectual Property</Title>
          <Paragraph>
            Providers retain ownership of their content (photos, descriptions,
            etc.) but grant Korí a non-exclusive license to display it on the
            platform.
          </Paragraph>

          <Title level={4}>9. Suspension or Termination</Title>
          <Paragraph>
            Korí reserves the right to suspend or delete any provider account in
            case of violation of these Terms or inappropriate behavior.
          </Paragraph>

          <Title level={4}>10. Governing Law</Title>
          <Paragraph>
            These Terms are governed by the laws of the Province of Quebec and
            the applicable federal laws of Canada.
          </Paragraph>

          <Divider />

          <Paragraph italic>
            En utilisant la plateforme Korí en tant que prestataire, vous
            acceptez ces conditions de service.
            <br />
            <br />
            By using the Korí platform as a service provider, you agree to these
            Terms.
          </Paragraph>
        </Typography>
      </Content>
    </div>
  );
}

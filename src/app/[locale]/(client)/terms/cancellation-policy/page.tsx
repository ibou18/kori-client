"use client";
import { LOGO_BLACK } from "@/shared/constantes";
import { Alert, Divider, Layout, Typography } from "antd";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

/**
 * Politique d'annulation – Kori (version client)
 */
export default function CancellationPolicy(): JSX.Element {
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
          <Title level={2}>Politique d&apos;annulation</Title>
          <Paragraph italic type="secondary" style={{ textAlign: "center" }}>
            Dernière mise à jour : 15 septembre 2025
          </Paragraph>

          <Divider />

          <Title level={3}>1. Délais d&apos;annulation</Title>
          <Paragraph>
            Pour annuler votre rendez-vous sans frais, vous devez nous prévenir
            au moins 24 heures à l&apos;avance. Les annulations effectuées moins
            de 24 heures avant le rendez-vous sont soumises à des frais
            d&apos;annulation.
          </Paragraph>

          <Title level={3}>2. Frais d&apos;annulation</Title>
          <Paragraph>
            Les frais d&apos;annulation sont appliqués selon le délai de préavis
            :
            <ul>
              <li>Plus de 24h à l&apos;avance : Annulation gratuite</li>
              <li>Moins de 24h à l&apos;avance : 100% de l&apos;acompte</li>
            </ul>
          </Paragraph>

          <Title level={3}>3. Acompte et remboursement</Title>
          <Paragraph>
            Un acompte de 15% du montant du service est requis lors de la
            réservation. Cet acompte vous sera remboursé intégralement en cas
            d&apos;annulation gratuite.
          </Paragraph>

          <Title level={3}>4. Annulation par le salon</Title>
          <Paragraph>
            En cas d&apos;annulation de notre part (maladie, urgence, conditions
            météorologiques), nous vous proposerons :
            <ul>
              <li>Un nouveau rendez-vous prioritaire</li>
              <li>Un remboursement intégral immédiat</li>
              <li>Une compensation pour les désagréments causés</li>
            </ul>
          </Paragraph>

          <Title level={3}>5. Conditions spéciales</Title>
          <Paragraph>
            Des exceptions peuvent être accordées dans les cas suivants :
            <ul>
              <li>Urgence médicale (justificatif requis)</li>
              <li>Conditions météorologiques extrêmes</li>
              <li>Transport public perturbé</li>
              <li>Cas de force majeure</li>
            </ul>
          </Paragraph>

          <Title level={3}>6. Retard à un rendez-vous</Title>
          <Paragraph>
            En cas de retard, nous vous demandons de nous prévenir
            immédiatement. Nous essaierons de vous accueillir selon nos
            disponibilités, mais nous nous réservons le droit d&apos;annuler le
            rendez-vous si le retard dépasse 15 minutes.
          </Paragraph>

          <Title level={3}>7. Modification de rendez-vous</Title>
          <Paragraph>
            Les modifications de rendez-vous (date, heure, service) sont
            possibles jusqu&apos;à 12 heures avant le rendez-vous, sous réserve
            de disponibilité. Aucun frais n&apos;est appliqué pour les
            modifications dans ce délai.
          </Paragraph>

          <Title level={3}>8. Procédure d&apos;annulation</Title>
          <Paragraph>
            Pour annuler votre rendez-vous :
            <ul>
              <li>Via l&apos;application Kori (recommandé)</li>
              <li>Par téléphone directement au salon</li>
              <li>Par e-mail avec confirmation de réception</li>
            </ul>
            Conservez toujours une preuve de votre demande d&apos;annulation.
          </Paragraph>

          <Title level={3}>9. Réclamations</Title>
          <Paragraph>
            En cas de désaccord concernant les frais d&apos;annulation, vous
            pouvez nous contacter dans les 48 heures suivant l&apos;incident.
            Nous examinerons chaque cas individuellement et de manière
            équitable.
          </Paragraph>

          <Title level={3}>10. Contact</Title>
          <Paragraph>
            Pour toute question concernant notre politique d&apos;annulation :
            <br />
            <br />
            Support client :{" "}
            <Text strong>
              <Link href={`mailto:support@kori.app`}>support@kori.app</Link>
            </Text>
            {/* <br />
            Téléphone : <Text strong>{process.env.PHONE_CONTACT}</Text>
            <br /> */}
            Disponible : <Text strong>Lundi-Dimanche, 8h-20h</Text>
          </Paragraph>

          <Divider />

          <Alert
            message="Important"
            description="Cette politique d'annulation fait partie intégrante de nos conditions de service. En réservant un rendez-vous, vous acceptez ces conditions."
            type="warning"
            showIcon
            style={{ marginBottom: "24px" }}
          />

          <Paragraph italic style={{ textAlign: "center" }}>
            Nous nous efforçons d&apos;être flexibles tout en respectant le
            travail de nos professionnels. Merci de votre compréhension.
          </Paragraph>
        </Typography>
      </Content>
    </div>
  );
}

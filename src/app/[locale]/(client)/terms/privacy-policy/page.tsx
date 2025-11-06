"use client";
import { LOGO_BLACK } from "@/shared/constantes";
import { Divider, Layout, Typography } from "antd";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

/**
 * Politique de confidentialité – Kori (version client)
 */
export default function PrivacyPolicy(): JSX.Element {
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
          <Title level={2}>Politique de confidentialité</Title>
          <Paragraph italic type="secondary" style={{ textAlign: "center" }}>
            Dernière mise à jour : 15 septembre 2025
          </Paragraph>

          <Divider />

          <Title level={3}>1. Collecte des informations</Title>
          <Paragraph>
            Nous collectons des informations lorsque vous vous inscrivez sur
            notre application, réservez un service, ou interagissez avec nos
            fonctionnalités. Les informations collectées incluent votre nom,
            adresse e-mail, numéro de téléphone, et préférences de services.
          </Paragraph>

          <Title level={3}>2. Utilisation des informations</Title>
          <Paragraph>
            Les informations que nous collectons sont utilisées pour :
            <ul>
              <li>Traiter vos réservations et transactions</li>
              <li>Améliorer notre service client</li>
              <li>Envoyer des notifications relatives à vos rendez-vous</li>
              <li>Personnaliser votre expérience utilisateur</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </Paragraph>

          <Title level={3}>3. Protection des données</Title>
          <Paragraph>
            Nous mettons en œuvre une variété de mesures de sécurité pour
            protéger la sécurité de vos informations personnelles. Vos données
            sont stockées sur des serveurs sécurisés avec chiffrement et accès
            restreint.
          </Paragraph>

          <Title level={3}>4. Partage des informations</Title>
          <Paragraph>
            Nous ne vendons, n&apos;échangeons, ni ne transférons vos
            informations personnelles à des tiers, sauf dans les cas suivants :
            <ul>
              <li>
                Avec les salons partenaires pour le traitement de vos
                réservations
              </li>
              <li>
                Avec nos prestataires de services (paiement, notifications)
              </li>
              <li>
                En cas d&apos;obligation légale ou de protection de nos droits
              </li>
            </ul>
          </Paragraph>

          <Title level={3}>5. Cookies et technologies similaires</Title>
          <Paragraph>
            Notre application utilise des technologies de suivi pour améliorer
            votre expérience. Vous pouvez désactiver ces fonctionnalités dans
            les paramètres de votre appareil.
          </Paragraph>

          <Title level={3}>6. Vos droits</Title>
          <Paragraph>
            Conformément au RGPD et aux lois applicables, vous avez le droit de
            :
            <ul>
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier ou mettre à jour vos informations</li>
              <li>Supprimer votre compte et vos données</li>
              <li>Vous opposer au traitement de vos données</li>
              <li>Demander la portabilité de vos données</li>
            </ul>
          </Paragraph>

          <Title level={3}>7. Conservation des données</Title>
          <Paragraph>
            Nous conservons vos informations personnelles aussi longtemps que
            nécessaire pour vous fournir nos services et respecter nos
            obligations légales. Les données de compte inactives sont supprimées
            après 3 ans.
          </Paragraph>

          <Title level={3}>8. Modifications de cette politique</Title>
          <Paragraph>
            Nous nous réservons le droit de mettre à jour cette politique de
            confidentialité à tout moment. Les modifications importantes vous
            seront notifiées par e-mail ou via l&apos;application.
          </Paragraph>

          <Title level={3}>9. Contact</Title>
          <Paragraph>
            Pour toute question concernant cette politique de confidentialité,
            veuillez nous contacter à :
            <br />
            <br />
            E-mail :{" "}
            <Text strong>
              <Link href={`mailto:privacy@kori.app`}>privacy@kori.app</Link>
            </Text>
            <br />
            Téléphone : <Text strong>+1 (555) 123-4567</Text>
            <br />
            Adresse :{" "}
            <Text strong>123 Rue de la Beauté, Montréal, QC, Canada</Text>
          </Paragraph>

          <Divider />

          <Paragraph italic>
            En utilisant l&apos;application Kori, vous acceptez cette politique
            de confidentialité.
          </Paragraph>
        </Typography>
      </Content>
    </div>
  );
}

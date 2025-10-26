"use client";
import { LOGO_BLACK } from "@/shared/constantes";
import { Divider, Layout, Typography } from "antd";
import { motion } from "framer-motion";
import Image from "next/image";

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
          <Divider />
          <Paragraph>
            Bienvenue sur la politique de confidentialité de Kori. Cette page
            décrit comment nous collectons, utilisons, partageons et protégeons
            vos données.
          </Paragraph>

          <Title level={3}>1. Qui sommes-nous ?</Title>
          <Paragraph>
            Kori est une plateforme qui met en relation des utilisateurs pour
            des services du quotidien, des transferts d’argent et le transport
            de colis.
          </Paragraph>

          <Title level={3}>2. Données collectées</Title>
          <Paragraph>
            Nous collectons uniquement les données nécessaires :
            <ul>
              <li>
                <Text strong>Données de compte</Text> : nom, prénom, e-mail, mot
                de passe (haché), photo de profil.
              </li>
              <li>
                <Text strong>Vérification d’identité</Text> (le cas échéant) :
                document d’identité, selfie/vidéo de vérification, résultat de
                contrôle KYC.
              </li>
              <li>
                <Text strong>Données de transaction</Text> : montants, moyens de
                paiement, états, historiques, reçus (pas de stockage des numéros
                complets de carte).
              </li>
              <li>
                <Text strong>Contenus & communications</Text> : annonces,
                messages, avis.
              </li>
              <li>
                <Text strong>Données techniques</Text> : logs, device, langue,
                navigateur, adresse IP, cookies.
              </li>
              <li>
                <Text strong>Localisation</Text> (si autorisée) : zone
                approximative pour améliorer la pertinence des résultats.
              </li>
            </ul>
          </Paragraph>

          <Title level={3}>3. Finalités d’utilisation</Title>
          <Paragraph>
            <ul>
              <li>Gestion du compte, authentification et sécurité.</li>
              <li>Mise en relation, publication et visibilité des annonces.</li>
              <li>Traitement des paiements, transferts et historiques.</li>
              <li>
                Prévention des fraudes, vérification d’identité et conformité.
              </li>
              <li>
                Support client, amélioration du produit, statistiques d’usage.
              </li>
              <li>
                Notifications de service et, sur consentement, communications
                marketing.
              </li>
            </ul>
          </Paragraph>

          <Title level={3}>4. Bases légales</Title>
          <Paragraph>
            Selon votre juridiction (RGPD, PIPEDA…), le traitement s’appuie sur
            :
            <ul>
              <li>
                Exécution d’un contrat (gestion du compte et des services).
              </li>
              <li>
                Intérêt légitime (sécurité, prévention de la fraude,
                amélioration).
              </li>
              <li>
                Consentement (localisation, cookies non essentiels, marketing).
              </li>
              <li>
                Obligation légale (lutte anti‑blanchiment, vérifications).
              </li>
            </ul>
          </Paragraph>

          <Title level={3}>5. Partage des données</Title>
          <Paragraph>
            <ul>
              <li>
                Prestataires techniques (hébergement, support, analytics) sous
                contrat.
              </li>
              <li>Fournisseurs de paiement et partenaires Stripe Inc.</li>
              <li>
                Autres utilisateurs lorsque nécessaire (p. ex. après
                acceptation).
              </li>
              <li>Autorités compétentes lorsque la loi l’exige.</li>
            </ul>
            Nous ne vendons pas vos données. Les prestataires agissent selon nos
            instructions.
          </Paragraph>

          <Title level={3}>6. Transferts internationaux</Title>
          <Paragraph>
            Vos données peuvent être traitées hors de votre pays. Nous
            appliquons des garanties appropriées (p. ex. clauses contractuelles
            types) lorsque requis.
          </Paragraph>

          <Title level={3}>7. Durées de conservation</Title>
          <Paragraph>
            <ul>
              <li>
                Compte et contenus : tant que le compte est actif, puis jusqu’à
                24 mois.
              </li>
              <li>
                Transactions et documents légaux : selon les obligations
                applicables.
              </li>
              <li>
                Logs sécurité : conservation courte, sauf incident ou
                obligation.
              </li>
            </ul>
          </Paragraph>

          <Title level={3}>8. Sécurité</Title>
          <Paragraph>
            Mesures techniques et organisationnelles (chiffrement en transit,
            contrôle d’accès, surveillance). Aucune méthode n’étant infaillible,
            nous améliorons en continu.
          </Paragraph>

          <Title level={3}>9. Cookies et technologies similaires</Title>
          <Paragraph>
            Cookies nécessaires au fonctionnement. Avec votre consentement :
            mesure d’audience et, le cas échéant, marketing. Gérez vos
            préférences via votre navigateur et/ou la bannière.
          </Paragraph>

          <Title level={3}>10. Vos droits</Title>
          <Paragraph>
            Accès, rectification, effacement, limitation, opposition,
            portabilité. Vous pouvez retirer votre consentement à tout moment
            lorsque le traitement en dépend.
          </Paragraph>

          <Title level={3}>11. Mineurs</Title>
          <Paragraph>
            Kori n'est pas destiné aux moins de 16 ans. Si des données d'un
            mineur nous ont été transmises, contactez‑nous pour suppression.
          </Paragraph>

          <Title level={3}>12. Modifications</Title>
          <Paragraph>
            Nous pouvons mettre à jour cette politique. La date de dernière mise
            à jour figure ci‑dessous.
          </Paragraph>

          <Title level={3}>13. Contact</Title>
          <Paragraph>
            Pour toute question ou pour exercer vos droits :{" "}
            <Text strong>support@koribeauty.com</Text>.
          </Paragraph>

          <Divider />

          <Paragraph>Date de dernière mise à jour : 26 Octobre 2025</Paragraph>
        </Typography>
      </Content>
    </div>
  );
}

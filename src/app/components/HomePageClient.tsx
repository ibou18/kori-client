"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Facebook,
  Heart,
  Instagram,
  MapPin,
  Scissors,
  Shield,
  Star,
  Twitter,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import android from "@/assets/photos/android.png";
import apple from "@/assets/photos/apple.png";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { KoriEmailColors } from "@/utils/koriColors";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Données de l'application korí - Services de beauté afro
const features = [
  {
    name: "Recherche de prestataires",
    description:
      "Trouvez les meilleurs coiffeurs, barbiers et salons spécialisés en beauté afro près de chez vous.",
    icon: MapPin,
    color: KoriEmailColors.primary[500],
    detail: "Géolocalisation précise, profils détaillés et avis authentiques.",
  },
  {
    name: "Réservation en ligne",
    description:
      "Réservez vos prestations de beauté afro en toute simplicité, 24h/24 et 7j/7.",
    icon: Calendar,
    color: KoriEmailColors.primary[600],
    detail:
      "Planning en temps réel, confirmation instantanée et rappels automatiques.",
  },
  {
    name: "Services spécialisés",
    description:
      "Tresses, coupes, coiffures et soins capillaires adaptés aux cheveux afro.",
    icon: Scissors,
    color: KoriEmailColors.primary[700],
    detail: "Expertise reconnue, techniques spécialisées et produits adaptés.",
  },
  {
    name: "Communauté de confiance",
    description:
      "Prestataires vérifiés, évaluations authentiques et expériences partagées.",
    icon: Heart,
    color: KoriEmailColors.primary[800],
    detail: "Sélection rigoureuse, modération active et support client dédié.",
  },
];

const testimonials = [
  {
    quote:
      "korí m'a permis de trouver la coiffeuse parfaite pour mes tresses. Réservation simple et résultat impeccable !",
    author: "Amina Benali",
    role: "Cliente",
    avatar: `https://ui-avatars.com/api/?name=Amina+Benali&background=0066CC&color=fff&size=100`,
  },
  {
    quote:
      "En tant que coiffeuse spécialisée, korí m'apporte de nouveaux clients chaque semaine. Une plateforme géniale !",
    author: "Marie-Claire N'Diaye",
    role: "Coiffeuse",
    avatar: `https://ui-avatars.com/api/?name=Marie+Claire&background=33CC99&color=fff&size=100`,
  },
  {
    quote:
      "J'ai réservé ma coupe afro en 2 minutes. Le salon était exactement comme décrit et le service parfait !",
    author: "Fatima Ouali",
    role: "Utilisatrice",
    avatar: `https://ui-avatars.com/api/?name=Fatima+Ouali&background=FF6B6B&color=fff&size=100`,
  },
];

const faqs = [
  {
    question: "Comment réserver un service de beauté afro ?",
    answer:
      "Recherchez un prestataire près de chez vous, choisissez votre service et votre créneau, puis confirmez votre réservation. C'est simple et rapide !",
  },
  {
    question: "Les paiements sont-ils sécurisés ?",
    answer:
      "Oui, tous les paiements sont sécurisés via Stripe. Vos informations bancaires sont protégées et chaque transaction est tracée.",
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer:
      "Oui, vous pouvez annuler votre réservation selon notre politique d'annulation. Des frais peuvent s'appliquer selon le délai d'annulation.",
  },
  {
    question: "Comment devenir prestataire sur korí ?",
    answer:
      "Inscrivez-vous en tant que prestataire, complétez votre profil avec vos spécialités et photos, puis commencez à recevoir des réservations.",
  },
  {
    question: "korí est-il disponible dans ma région ?",
    answer:
      "korí se développe progressivement au Canada. Vérifiez sur l'app si des prestataires sont disponibles dans votre région.",
  },
];

/**
 * Landing page korí – plateforme de réservation de services de beauté afro.
 */
export default function HomePageClient(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();

  const getBackgroundColorClass = (color: string) => {
    // Retourne la couleur de fond correspondante aux couleurs korí
    switch (color) {
      case KoriEmailColors.primary[500]:
        return KoriEmailColors.primary[50];
      case KoriEmailColors.primary[600]:
        return KoriEmailColors.primary[100];
      case KoriEmailColors.primary[700]:
        return KoriEmailColors.primary[200];
      case KoriEmailColors.primary[800]:
        return KoriEmailColors.primary[300];
      default:
        return KoriEmailColors.background.tertiary;
    }
  };

  useEffect(() => {
    if (session?.user) {
      router.push("/admin/dashboard");
    }
  }, [router, session?.user]);

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${KoriEmailColors.background.tertiary}, ${KoriEmailColors.background.secondary})`,
      }}
    >
      {/* Section Hero */}

      {/* <motion.div
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
          src={logo}
          width={1000}
          height={500}
          alt="korí"
          className="inset-0 text-center mx-auto m-8 h-[200px] w-[500px] object-contain hover:scale-105 transition-transform duration-300"
        />
      </motion.div> */}

      <div className="mx-auto max-w-7xl px-4 pt-10 text-center sm:pt-5">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
            La beauté afro à portée de main,
            <motion.span className="relative inline-block">
              <span className="relative">
                réservez vos prestations
                <motion.div className="absolute bottom-0 left-0 w-full h-2 bg-blue-400/30" />
              </span>
            </motion.span>
          </h1>
        </motion.div>

        <motion.p className="mt-8 text-pretty mx-auto max-w-2xl text-lg font-medium text-gray-600 sm:text-xl/8">
          Réservez vos prestations de beauté afro en toute simplicité. Trouvez
          les meilleurs coiffeurs, barbiers et salons spécialisés près de chez
          vous. Simple, rapide et de confiance.
        </motion.p>

        <motion.div
          className="mt-5 flex items-center justify-center gap-x-2"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            style={{
              backgroundColor: KoriEmailColors.primary[500],
              borderColor: KoriEmailColors.primary[500],
            }}
            className="hover:opacity-90"
          >
            {/* <Link href="#">Télécharger l'app</Link> */}
            <Link href="/landing-page">S'inscrire comme prestataire</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/auth/signin">Se connecter →</Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-10 font-black text-lg flex items-center justify-center gap-x-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          Disponible sur mobile
        </motion.div>

        <motion.div
          className="mt-5 flex items-center justify-center gap-x-6"
          variants={fadeInUp}
          initial={{ opacity: 0, y: 90 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="#" className="transition-transform hover:scale-105">
            <Image
              width={200}
              height={100}
              src={apple}
              alt="App Store"
              className="h-16 object-contain"
            />
          </Link>
          <Link href="#" className="transition-transform hover:scale-105">
            <Image
              width={220}
              height={120}
              src={android}
              alt="Google Play"
              className="h-14 object-contain"
            />
          </Link>
        </motion.div>

        {/* <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ImageCarousel />
        </motion.div> */}

        {/* Section Fonctionnalités */}
        <motion.section
          className="mx-auto mt-20 max-w-7xl px-6 sm:mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.div
            className="mx-auto max-w-2xl lg:text-center"
            variants={fadeInUp}
          >
            <Badge
              variant="outline"
              className="mb-4 px-3 py-1 text-sm font-medium"
              style={{
                color: KoriEmailColors.primary[600],
                borderColor: KoriEmailColors.primary[200],
                backgroundColor: KoriEmailColors.primary[50],
              }}
            >
              Fonctionnalités
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Une plateforme dédiée à la beauté afro
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              korí connecte les clients aux meilleurs prestataires spécialisés
              en beauté afro. Réservations sécurisées, avis authentiques et
              expérience personnalisée.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-18 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div key={feature.name} variants={fadeInUp} custom={index}>
                <Card className="h-full transition-all hover:shadow-md hover:border-blue-200">
                  <CardContent className="p-6">
                    <div
                      className="rounded-full w-12 h-12 flex items-center justify-center mb-4"
                      style={{
                        backgroundColor: getBackgroundColorClass(feature.color),
                      }}
                    >
                      <feature.icon
                        className="h-6 w-6"
                        style={{ color: feature.color }}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="mt-3 text-gray-600">{feature.description}</p>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <p className="text-sm text-muted-foreground italic">
                      {feature.detail}
                    </p>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Section Comment ça marche */}
        <motion.section
          className="mx-auto mt-20 max-w-7xl px-6 sm:mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.div
            className="mx-auto max-w-2xl lg:text-center mb-16"
            variants={fadeInUp}
          >
            <Badge
              variant="outline"
              className="mb-4 px-3 py-1 text-sm font-medium"
              style={{
                color: KoriEmailColors.primary[600],
                borderColor: KoriEmailColors.primary[200],
                backgroundColor: KoriEmailColors.primary[50],
              }}
            >
              Comment ça marche
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              En 4 étapes simples
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div className="text-center" variants={fadeInUp}>
              <div
                className="text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold"
                style={{ backgroundColor: KoriEmailColors.primary[500] }}
              >
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Créez votre profil</h3>
              <p className="text-gray-600">
                Inscrivez-vous et complétez votre profil avec vos préférences de
                beauté et vos informations personnelles
              </p>
              <div className="mt-6 flex justify-center">
                <UserCheck
                  className="h-14 w-14 opacity-70"
                  style={{ color: KoriEmailColors.primary[500] }}
                />
              </div>
            </motion.div>

            <motion.div className="text-center" variants={fadeInUp}>
              <div
                className="text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold"
                style={{ backgroundColor: KoriEmailColors.primary[600] }}
              >
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Recherchez et comparez
              </h3>
              <p className="text-gray-600">
                Trouvez les meilleurs prestataires près de chez vous, comparez
                les prix et lisez les avis clients
              </p>
              <div className="mt-6 flex justify-center">
                <MapPin
                  className="h-14 w-14 opacity-70"
                  style={{ color: KoriEmailColors.primary[600] }}
                />
              </div>
            </motion.div>

            <motion.div className="text-center" variants={fadeInUp}>
              <div
                className="text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold"
                style={{ backgroundColor: KoriEmailColors.primary[700] }}
              >
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Réservez en toute simplicité
              </h3>
              <p className="text-gray-600">
                Choisissez votre créneau, confirmez votre réservation et payez
                en toute sécurité
              </p>
              <div className="mt-6 flex justify-center">
                <Calendar
                  className="h-14 w-14 opacity-70"
                  style={{ color: KoriEmailColors.primary[700] }}
                />
              </div>
            </motion.div>

            <motion.div className="text-center" variants={fadeInUp}>
              <div
                className="text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold"
                style={{ backgroundColor: KoriEmailColors.primary[800] }}
              >
                4
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Profitez et évaluez
              </h3>
              <p className="text-gray-600">
                Recevez votre prestation et partagez votre expérience pour aider
                la communauté
              </p>
              <div className="mt-6 flex justify-center">
                <Star
                  className="h-14 w-14 opacity-70"
                  style={{ color: KoriEmailColors.primary[800] }}
                />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Section Témoignages */}
        <motion.section
          className="py-12 mt-10"
          style={{
            background: `linear-gradient(to bottom, ${KoriEmailColors.primary[50]}, ${KoriEmailColors.background.secondary})`,
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-8"
              variants={fadeInUp}
            >
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm font-medium"
                style={{
                  color: KoriEmailColors.primary[600],
                  borderColor: KoriEmailColors.primary[200],
                  backgroundColor: KoriEmailColors.primary[50],
                }}
              >
                Témoignages
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ce que dit notre communauté
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto max-w-5xl">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  variants={fadeInUp}
                  custom={index}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Section FAQ */}
        <motion.section
          className="py-24"
          style={{ backgroundColor: KoriEmailColors.background.tertiary }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <div className="mx-auto max-w-4xl px-6">
            <motion.div className="text-center mb-16" variants={fadeInUp}>
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm font-medium"
                style={{
                  color: KoriEmailColors.primary[600],
                  borderColor: KoriEmailColors.primary[200],
                  backgroundColor: KoriEmailColors.primary[50],
                }}
              >
                FAQ
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Questions fréquentes
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Tout ce que vous devez savoir sur korí
              </p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            <motion.div className="mt-12 text-center" variants={fadeInUp}>
              <p className="text-gray-600 mb-6">
                Vous avez d&apos;autres questions?
              </p>
              <Button asChild variant="outline">
                <Link href="/support">
                  Contactez-nous
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Section CTA */}
        <motion.section
          className="py-24 text-white"
          style={{
            background: `linear-gradient(135deg, ${KoriEmailColors.primary[600]} 0%, ${KoriEmailColors.primary[500]} 100%)`,
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Rejoignez la communauté korí dès aujourd'hui
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Découvrez les meilleurs prestataires de beauté afro et réservez
              vos prestations en toute simplicité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white hover:bg-gray-100"
                style={{
                  color: KoriEmailColors.primary[600],
                }}
              >
                <Link href="#">Télécharger l'application</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white/10"
              >
                <Link href="/contact">En savoir plus</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-3">
              <Shield className="h-5 w-5" />
              <p className="text-sm">
                Profils vérifiés et communauté de confiance
              </p>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">korí</h3>
                <p className="text-gray-300 mb-4">
                  La plateforme de réservation de services de beauté afro qui
                  connecte les clients aux meilleurs prestataires spécialisés.
                </p>
                <div className="flex space-x-4">
                  <Facebook className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
                  <Instagram className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
                  <Twitter className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Liens utiles</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/about" className="hover:text-white">
                      À propos
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms/cgu-pro" className="hover:text-white">
                      Conditions de service - Prestataires
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms/cgu-client" className="hover:text-white">
                      Conditions de service - Clients
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms/privacy" className="hover:text-white">
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms/cgv" className="hover:text-white">
                      Conditions générales de vente
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    <Link href="/help" className="hover:text-white">
                      Centre d'aide
                    </Link>
                  </li>
                  <li>
                    <Link href="/security" className="hover:text-white">
                      Sécurité
                    </Link>
                  </li>
                  <li>
                    <Link href="/community" className="hover:text-white">
                      Communauté
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Téléchargez l'app</h4>
                <div className="space-y-3">
                  <Link href="#" className="block">
                    <Image
                      src={apple}
                      alt="App Store"
                      width={150}
                      height={50}
                      className="h-12 w-auto"
                    />
                  </Link>
                  <Link href="#" className="block">
                    <Image
                      src={android}
                      alt="Google Play"
                      width={150}
                      height={50}
                      className="h-12 w-auto"
                    />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} korí. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

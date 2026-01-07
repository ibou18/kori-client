"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  comment: string;
  rating: number;
  role?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sophie M.",
    role: "Propriétaire de salon",
    comment:
      "Kori a transformé ma façon de gérer mon salon. Les réservations sont maintenant simples et mes clients adorent l'expérience !",
    rating: 5,
  },
  {
    id: 2,
    name: "Marie L.",
    role: "Coiffeuse indépendante",
    comment:
      "Une application intuitive qui m'a permis d'augmenter mes réservations de 40% en seulement 3 mois. Je recommande vivement !",
    rating: 5,
  },
  {
    id: 3,
    name: "Julie D.",
    role: "Esthéticienne",
    comment:
      "Gérer mes clients et mes rendez-vous n'a jamais été aussi facile. L'interface est magnifique et tout fonctionne parfaitement.",
    rating: 5,
  },
  {
    id: 4,
    name: "Camille R.",
    role: "Propriétaire de salon",
    comment:
      "Mes clients apprécient la facilité de réservation. L'application est vraiment professionnelle et m'a fait gagner beaucoup de temps.",
    rating: 5,
  },
  {
    id: 5,
    name: "Émilie T.",
    role: "Maquilleuse",
    comment:
      "Rejoindre Kori a été la meilleure décision pour mon activité. Je reçois maintenant des réservations régulières et mes revenus ont augmenté.",
    rating: 5,
  },
];

// Dupliquer les témoignages pour créer une boucle infinie
const duplicatedTestimonials = [...testimonials, ...testimonials];

export function TestimonialsCarousel() {
  return (
    <div className="relative overflow-hidden py-0 px-4 bg-gradient-to-b from-transparent to-white/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Rejoignez des milliers de professionnels satisfaits
          </h3> */}
          <h4 className="text-gray-600 text-sm md:text-sm">
            Découvrez pourquoi nos utilisateurs recommandent Kori
          </h4>
        </motion.div>

        {/* Masque pour créer un effet de fondu sur les bords */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/50 to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-4"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="flex-shrink-0 w-[280px] md:w-[320px] px-2"
              >
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  {/* Étoiles */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Commentaire */}
                  <p className="text-gray-700 text-xs md:text-sm leading-relaxed mb-3 line-clamp-3">
                    &quot;{testimonial.comment}&quot;
                  </p>

                  {/* Auteur */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-xs">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-xs truncate">
                        {testimonial.name}
                      </p>
                      {testimonial.role && (
                        <p className="text-[10px] text-gray-500 truncate">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

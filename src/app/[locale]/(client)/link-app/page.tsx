"use client";

import { motion } from "framer-motion";
import { Download, Smartphone, Star, Users, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const screenshots = [
  "/assets/screenshot/IMG_7325.PNG",
  "/assets/screenshot/IMG_7326.PNG",
  "/assets/screenshot/IMG_7327.PNG",
  "/assets/screenshot/IMG_7328.PNG",
  "/assets/screenshot/IMG_7329.PNG",
];

export default function DownloadAppPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % screenshots.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Trajets Rapides",
      description: "Trouvez un covoiturage en quelques minutes",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Communauté Active",
      description: "Rejoignez des milliers de conducteurs et passagers",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Service Premium",
      description: "Expérience de covoiturage exceptionnelle",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-600 to-pink-600 animate-gradient">
        {/* Floating Bubbles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: `hsl(${Math.random() * 360}, 70%, 60%)`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Téléchargez AlloGo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
          >
            Téléchargez l'application AlloGo pour commencer vos trajets en
            covoiturage.
          </motion.p>
        </div>

        {/* Download Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16"
        >
          {/* Android Download */}
          <motion.a
            href="https://bit.ly/allogo-android"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.5036C15.5902 12.2438 13.8533 11.5 12 11.5c-1.8533 0-3.5902.7438-4.9855 1.9093L5.1722 9.9059a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676L6.1185 13.3214C4.6885 14.4897 3.5 16.1387 3.5 18.5v.5c0 1.3807 1.1193 2.5 2.5 2.5h15c1.3807 0 2.5-1.1193 2.5-2.5v-.5c0-2.3613-1.1885-4.0103-2.6185-5.1786" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm text-white/70">Télécharger sur</div>
                <div className="text-xl font-bold text-white">Google Play</div>
              </div>
              <Download className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
            </div>
          </motion.a>

          {/* iOS Download */}
          <motion.a
            href="https://apple.co/4lPhmNY"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm text-white/70">Télécharger sur</div>
                <div className="text-xl font-bold text-white">App Store</div>
              </div>
              <Download className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
            </div>
          </motion.a>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/80">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Screenshots Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="relative"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
            Découvrez l'Application
          </h2>

          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-96 md:h-[600px] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20">
              {screenshots.map((screenshot, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: currentImageIndex === index ? 1 : 0,
                    scale: currentImageIndex === index ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={screenshot}
                    alt={`Capture d'écran AlloGo ${index + 1}`}
                    fill
                    className="object-contain"
                    priority={index === 0}
                  />
                </motion.div>
              ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentImageIndex === index
                      ? "bg-white scale-125"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Prêt à commencer ?
          </h3>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à AlloGo
            pour leurs trajets. Téléchargez maintenant et profitez d'une
            expérience de covoiturage exceptionnelle !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="https://bit.ly/allogo-android"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smartphone className="w-5 h-5" />
              Télécharger pour Android
            </motion.a>
            <motion.a
              href="https://apple.co/4lPhmNY"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smartphone className="w-5 h-5" />
              Télécharger pour iOS
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

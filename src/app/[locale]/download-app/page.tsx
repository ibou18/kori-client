"use client";

import { motion } from "framer-motion";
import { Smartphone, Star, Users, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const screenshots = [
  "/assets/screenshot/IMG_7655.PNG",
  "/assets/screenshot/IMG_7656.PNG",
  "/assets/screenshot/IMG_7657.PNG",
  "/assets/screenshot/IMG_7658.PNG",
  "/assets/screenshot/IMG_7659.PNG",
  "/assets/screenshot/IMG_7660.PNG",
  "/assets/screenshot/IMG_7661.PNG",
  "/assets/screenshot/IMG_7662.PNG",
  "/assets/screenshot/IMG_7663.PNG",
  "/assets/screenshot/IMG_7664.PNG",
  "/assets/screenshot/IMG_7665.PNG",
];

export default function DownloadAppPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const IOS_STORE_URL = "https://apple.co/4lPhmNde";
  const ANDROID_STORE_URL = "https://bit.ly/korí-android";
  const DEEP_LINK = "korí://";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % screenshots.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Services du quotidien",
      description: "Publiez vos besoins ou trouvez un prestataire près de vous",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Transferts sécurisés",
      description: "Envoyez et recevez de l'argent en toute confiance",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Transport de colis",
      description: "Faites livrer vos colis simplement et rapidement",
    },
  ];

  const handleOpenApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const storeUrl = isIOS ? IOS_STORE_URL : ANDROID_STORE_URL;
    const start = Date.now();

    const timeoutId = window.setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.location.href = storeUrl;
      }
    }, 1500);

    window.location.href = DEEP_LINK;

    window.setTimeout(() => window.clearTimeout(timeoutId), 3000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-gradient">
        {/* Subtle Floating Elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 80 + 30}px`,
              height: `${Math.random() * 80 + 30}px`,
              background: `linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-slate-800 mb-6"
          >
            Téléchargez korí
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto"
          >
            L'application pour vos services du quotidien, transferts d'argent et
            transport de colis. Rejoignez la communauté korí et simplifiez vos
            démarches !
          </motion.p>
        </div>

        {/* Download Buttons */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16"
        >
          <motion.a
            href={ANDROID_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl p-6 hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/android.png"
                  alt="Android"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="text-left">
                <div className="text-sm text-slate-600">Télécharger sur</div>
                <div className="text-xl font-bold text-slate-800">
                  Google Play
                </div>
              </div>
              <Download className="w-6 h-6 text-slate-600 group-hover:text-slate-800 transition-colors" />
            </div>
          </motion.a>

          <motion.a
            href={IOS_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl p-6 hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/apple.png"
                  alt="iOS"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="text-left">
                <div className="text-sm text-slate-600">Télécharger sur</div>
                <div className="text-xl font-bold text-slate-800">
                  App Store
                </div>
              </div>
              <Download className="w-6 h-6 text-slate-600 group-hover:text-slate-800 transition-colors" />
            </div>
          </motion.a>
        </motion.div> */}

        {/* Official Store Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <a
            href={IOS_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <Image
              src="/assets/apple.png"
              alt="Download on the App Store"
              width={180}
              height={54}
              className="h-12 w-auto object-contain"
            />
          </a>
          <a
            href={ANDROID_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <Image
              src="/assets/android.png"
              alt="Get it on Google Play"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
            />
          </a>
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
              className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl p-6 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <div className="text-blue-600">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.description}</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-8">
            Découvrez l'Application
          </h2>

          <div className="relative max-w-4xl mx-auto">
            <div className="flex justify-center">
              {/* iPhone 14 Pro Frame */}
              <div className="relative w-80 h-[600px] md:w-96 md:h-[700px]">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-black rounded-[3rem] shadow-2xl border-8 border-slate-800">
                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-20"></div>

                  {/* Screen Content */}
                  <div className="absolute inset-2 bg-white rounded-[2.5rem] overflow-hidden">
                    {screenshots.map((screenshot, index) => (
                      <motion.div
                        key={index}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: currentImageIndex === index ? 1 : 0,
                          scale: currentImageIndex === index ? 1 : 0.98,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image
                          src={screenshot}
                          alt={`Capture d'écran korí ${index + 1}`}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
                </div>

                {/* Phone Shadow */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-80 h-4 bg-black/20 rounded-full blur-xl"></div>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentImageIndex === index
                      ? "bg-blue-600 scale-125"
                      : "bg-slate-300 hover:bg-slate-400"
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
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
            Prêt à commencer ?
          </h3>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à korí pour
            leurs services, transferts et envois de colis. Téléchargez
            maintenant et profitez d'une expérience simple et sécurisée !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={handleOpenApp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smartphone className="w-5 h-5" />
              Ouvrir l’app
            </motion.button>
            <motion.a
              href={ANDROID_STORE_URL}
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
              href={IOS_STORE_URL}
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

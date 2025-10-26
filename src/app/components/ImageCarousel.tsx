import { motion } from "framer-motion";
import Image from "next/image";

const ImageCarousel = () => {
  const images = [
    "https://res.cloudinary.com/dgt1yqlk0/image/upload/v1744079914/3_wqjk8m.png",
    "https://res.cloudinary.com/dgt1yqlk0/image/upload/v1744080367/4_emlrhl.png",
    "https://res.cloudinary.com/dgt1yqlk0/image/upload/v1744079914/2_aus0lu.png",
    "https://res.cloudinary.com/dgt1yqlk0/image/upload/v1744079914/1_oywsl0.png",
    "https://res.cloudinary.com/dgt1yqlk0/image/upload/v1744080367/5_ivftug.png",
    "https://res.cloudinary.com/dgt1yqlk0/image/upload/v1744080368/6_gdaeol.png",
  ];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-orange-50/50 to-transparent py-12">
      <motion.div
        className="flex gap-8"
        animate={{
          x: [0, -1035],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {images.map((image, idx) => (
          <div
            key={idx}
            className="relative min-w-[400px] rounded-xl overflow-hidden shadow-lg"
          >
            <Image
              src={image}
              alt={`Feature screenshot ${idx + 1}`}
              width={400}
              height={300}
              className="object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ImageCarousel;

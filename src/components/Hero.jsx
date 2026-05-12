import { motion } from "framer-motion";

function Hero() {
  return (
    <section className="mobile-hero-stable relative w-full min-h-[100svh] h-[100svh] md:h-screen overflow-hidden" data-hero>
      {/* Background Video */}
      <video
        className="absolute inset-0 z-0 h-full w-full min-h-full object-cover object-center max-md:transform-none max-md:will-change-auto"
        src="/videos/allura-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Animated Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-gold px-6 pt-20 md:pt-28">
        <motion.h1
          className="text-5xl md:text-7xl font-elegant mb-6 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Luxury. Elegance. Empowerment.
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mb-10 max-w-2xl opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          Discover the artistry behind every strand. Experience hair redefined.
        </motion.p>

        <motion.div
          className="flex flex-col md:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <a
            href="/shop"
            className="bg-gold text-burgundy px-10 py-3 rounded-full text-lg font-semibold hover:bg-white hover:scale-105 transition-transform duration-300 shadow-md"
          >
            Shop Now
          </a>
          <a
            href="/about"
            className="border border-gold text-gold px-10 py-3 rounded-full text-lg font-semibold hover:bg-gold hover:text-burgundy hover:scale-105 transition-transform duration-300"
          >
            Explore Our Vision
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;

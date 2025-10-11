import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="flex flex-col justify-center items-center text-center py-24 px-6 md:px-16">
      <h1 className="text-5xl md:text-6xl font-elegant mb-6 leading-tight">
        Luxury. Elegance. Empowerment.
      </h1>
      <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl">
      </p>
      <Link
        to="/shop"
        className="bg-gold text-burgundy px-10 py-3 rounded-full text-lg font-semibold hover:bg-white hover:scale-105 transition-transform duration-300 shadow-md"
      >
        Shop Now
      </Link>
    </section>
  );
}

export default Hero;

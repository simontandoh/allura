import FadeInWhenVisible from "../components/FadeInWhenVisible";
import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="bg-burgundy text-gold">
      <Hero />

      <section className="py-20 px-6 md:px-20 text-center">
        <FadeInWhenVisible delay={0.2}>
          <h2 className="text-4xl font-elegant mb-6">
            Elevate Your Confidence
          </h2>
          <p className="max-w-2xl mx-auto mb-8 opacity-90 leading-relaxed">
            Discover ALLÜRA’s exclusive collection of premium wigs and
            extensions — designed to make you feel unstoppable.
          </p>
          <Link
            to="/shop"
            className="btn-gold inline-block px-10 py-3 text-lg mt-8"
          >
            Explore Collection
          </Link>
        </FadeInWhenVisible>
      </section>

      <FadeInWhenVisible delay={0.4}>
        <FeaturedProducts />
      </FadeInWhenVisible>
    </div>
  );
}

export default Home;

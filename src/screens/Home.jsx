import FadeInWhenVisible from "../components/FadeInWhenVisible";
import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";

function Home() {
  return (
    <div className="bg-burgundy text-gold">
      <Hero />

      <FadeInWhenVisible delay={0.2}>
        <FeaturedProducts />
      </FadeInWhenVisible>
    </div>
  );
}

export default Home;

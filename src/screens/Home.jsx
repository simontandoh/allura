import FadeInWhenVisible from "../components/FadeInWhenVisible";
import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";
import SeeTheLook from "../components/SeeTheLook";

function Home() {
  return (
    <div className="bg-burgundy text-gold">
      <Hero />

      <FadeInWhenVisible delay={0.2}>
        <FeaturedProducts />
      </FadeInWhenVisible>

      <FadeInWhenVisible delay={0.4}>
        <SeeTheLook />
      </FadeInWhenVisible>
    </div>
  );
}

export default Home;

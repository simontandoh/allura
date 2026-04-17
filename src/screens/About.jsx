import FadeInWhenVisible from "../components/FadeInWhenVisible";

function About() {
  return (
    <div className="pt-28 pb-16 px-6 md:px-20 bg-burgundy text-gold">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">About Allurahouse</h1>
      </FadeInWhenVisible>

      <FadeInWhenVisible delay={0.2}>
        <p className="max-w-3xl mx-auto text-lg opacity-90 leading-relaxed text-center">
          At ALLURAHOUSE, we believe your hair is your crown. Our mission is to
          empower confidence through exceptional quality, ethical sourcing,
          and timeless elegance.
        </p>
      </FadeInWhenVisible>

    </div>
  );
}

export default About;


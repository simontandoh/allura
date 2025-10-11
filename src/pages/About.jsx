import FadeInWhenVisible from "../components/FadeInWhenVisible";

function About() {
  return (
    <div className="py-20 px-6 md:px-20 bg-burgundy text-gold">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">About Allura</h1>
      </FadeInWhenVisible>

      <FadeInWhenVisible delay={0.2}>
        <p className="max-w-3xl mx-auto text-lg opacity-90 leading-relaxed text-center">
          At ALLÜRA, we believe your hair is your crown. Our mission is to
          empower confidence through exceptional quality, ethical sourcing,
          and timeless elegance.
        </p>
      </FadeInWhenVisible>

      <FadeInWhenVisible delay={0.4}>
        <div className="text-center mt-12">
          <button className="btn-gold px-10 py-3 text-lg">
            Explore Our Vision
          </button>
        </div>
      </FadeInWhenVisible>
    </div>
  );
}

export default About;

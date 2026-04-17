import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const LOOKBOOK_TESTIMONIALS = [
  {
    id: 1,
    name: "Anika",
    story:
      "The Midnight silk install stayed flawless through every shoot. I felt camera-ready in minutes.",
    look: 'Midnight silk press - 22"',
    palette: "Midnight - Sleek Straight",
    image:
      "https://images.unsplash.com/photo-1441123285228-1448e608f3d5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Renee",
    story:
      "Copper Ember gave me the blonde glow I wanted with zero brassiness. Everyone asked for the link.",
    look: 'Copper cascade - 24" Body Wave',
    palette: "Copper - Lived-in blonde",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Marisol",
    story:
      "My velvet brunette sew-in looks like a fresh blowout every day. The density feels so natural.",
    look: 'Velvet brown layers - 20"',
    palette: "Brown - Soft layers",
    image:
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=900&q=80",
  },
];

function SeeTheLook() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeLook = LOOKBOOK_TESTIMONIALS[activeIndex];

  const goPrev = () =>
    setActiveIndex((prev) => (prev === 0 ? LOOKBOOK_TESTIMONIALS.length - 1 : prev - 1));
  const goNext = () =>
    setActiveIndex((prev) => (prev === LOOKBOOK_TESTIMONIALS.length - 1 ? 0 : prev + 1));

  return (
    <section className="relative z-10 bg-[#3B0010] py-16 md:py-20 px-6 md:px-20 text-gold">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.6em] text-gold/60">See the look</p>
          <h2 className="text-4xl md:text-5xl font-elegant">Real women. Real movement.</h2>
          <p className="text-gold/70 max-w-2xl mx-auto text-sm md:text-base">
            Glide through the royal review showcase to meet the women already crowned by Allura.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={goPrev}
            aria-label="View previous testimonial"
            className="absolute -left-4 md:-left-10 top-1/2 -translate-y-1/2 bg-[#24000B] border border-gold/30 rounded-full p-3 text-gold hover:bg-gold hover:text-[#3B0010] transition z-10"
          >
            <FaChevronLeft />
          </button>

          <article
            key={activeLook.id}
            className="relative rounded-[32px] overflow-hidden border border-gold/20 bg-[#24000B] shadow-[0_15px_45px_rgba(0,0,0,0.45)] flex flex-col md:flex-row"
          >
            <div className="md:w-1/2 h-[360px] md:h-auto">
              <img
                src={activeLook.image}
                alt={`${activeLook.name} wearing ${activeLook.look}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 p-6 md:p-10 space-y-4">
              <p className="text-[11px] uppercase tracking-[0.5em] text-gold/60">
                {activeLook.palette}
              </p>
              <h3 className="text-3xl font-elegant">{activeLook.name}</h3>
              <p className="text-sm text-gold/70">{activeLook.look}</p>
              <p className="text-base md:text-lg text-gold/90 leading-relaxed italic">
                "{activeLook.story}"
              </p>
            </div>
          </article>

          <button
            type="button"
            onClick={goNext}
            aria-label="View next testimonial"
            className="absolute -right-4 md:-right-10 top-1/2 -translate-y-1/2 bg-[#24000B] border border-gold/30 rounded-full p-3 text-gold hover:bg-gold hover:text-[#3B0010] transition z-10"
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          {LOOKBOOK_TESTIMONIALS.map((look, index) => (
            <button
              key={look.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show testimonial from ${look.name}`}
              className={`w-3 h-3 rounded-full transition ${
                index === activeIndex ? "bg-gold" : "bg-gold/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SeeTheLook;

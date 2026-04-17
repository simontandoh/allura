import { useMemo, useState } from "react";
import FadeInWhenVisible from "../components/FadeInWhenVisible";
import { blogPosts } from "../data/blogPosts.js";

const categories = ["All", ...new Set(blogPosts.map((post) => post.category))];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return blogPosts;
    return blogPosts.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-burgundy text-gold pt-28 pb-16 px-6 md:px-16">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <FadeInWhenVisible>
          <p className="uppercase tracking-[0.4em] text-xs text-gold/60 mb-3">
            Insights & Stories
          </p>
          <h1 className="text-5xl font-elegant mb-4">The Allurahouse Journal</h1>
          <p className="text-gold/80 max-w-2xl mx-auto">
            Editorial recaps, data-backed forecasts, and conversations with the artists
            shaping the modern beauty economy.
          </p>
        </FadeInWhenVisible>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              activeCategory === category
                ? "bg-gold text-burgundy border-gold"
                : "border-gold/40 text-gold/80 hover:border-gold hover:text-gold"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {filteredPosts.map((post) => (
          <FadeInWhenVisible key={post.id}>
            <article className="bg-burgundy rounded-3xl overflow-hidden shadow-gold/40 border border-gold/10 flex flex-col h-full">
              <div className="h-56 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow gap-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gold/60">
                  <span>{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-2xl font-elegant">{post.title}</h2>
                <p className="text-gold/80 text-sm leading-relaxed">{post.excerpt}</p>
                <ul className="space-y-2 text-sm text-gold/70">
                  {post.content.map((paragraph, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gold/60" />
                      <span>{paragraph}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </FadeInWhenVisible>
        ))}
      </div>
    </div>
  );
}


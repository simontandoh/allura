/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        burgundy: "#2A0011",
        burgundyDark: "#150009",
        burgundySecondary: "#4B0013",
        gold: "#FFD77A",
      },
      fontFamily: {
        elegant: ["Cormorant Garamond", "Playfair Display", "serif"],
        clean: ["Space Grotesk", "Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: "#5E001B",
        burgundyDark: "#4B0013",
        gold: "#E4B32B",
        goldLight: "#FFD77A",
      },
      fontFamily: {
        elegant: ["Playfair Display", "serif"],
        clean: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};

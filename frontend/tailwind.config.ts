import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: "#22d3ee",
          purple: "#a855f7",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(34,211,238,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

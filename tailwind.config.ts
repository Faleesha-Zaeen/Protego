import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: "#22d3ee",
          purple: "#a855f7",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 45px rgba(56,189,248,0.35)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".cyber-gradient": {
          backgroundImage:
            "linear-gradient(120deg, rgba(34,211,238,0.9), rgba(168,85,247,0.9))",
        },
      });
    }),
  ],
};

export default config;

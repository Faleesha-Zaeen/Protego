/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        card: "#111827",
        border: "#1F2937",
        primary: "#6366F1",
        accent: "#22D3EE",
        safe: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
      },
      boxShadow: {
        glow: "0 0 40px rgba(99, 102, 241, 0.35)",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

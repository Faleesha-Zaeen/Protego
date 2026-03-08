/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f172a",
        card: "#1e293b",
        safe: "#22c55e",
        danger: "#ef4444",
        highlight: "#38bdf8",
      },
      boxShadow: {
        glow: "0 0 40px rgba(56, 189, 248, 0.4)",
      },
    },
  },
  plugins: [],
};

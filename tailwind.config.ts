import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#f1f3ff",
          100: "#e4e8ff",
          600: "#111844",
          700: "#0d1337",
          900: "#080d28",
        },
        gold: {
          50: "#fff6e9",
          100: "#ffe8c2",
          400: "#ffbd61",
          500: "#ffa733",
          600: "#FF9E20",
          700: "#b85f00",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(17, 24, 68, 0.10)",
        premium: "0 24px 80px rgba(26, 26, 26, 0.12)",
        glow: "0 0 0 5px rgba(255, 158, 32, 0.20), 0 22px 64px rgba(17, 24, 68, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;

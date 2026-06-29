import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#fbf2f5",
          100: "#f6dfe7",
          600: "#6E112D",
          700: "#5c0e25",
          900: "#4A0B1E",
        },
        gold: {
          50: "#fff9e8",
          100: "#fff0c2",
          400: "#f7c948",
          500: "#d9a441",
          600: "#D4AF37",
          700: "#96621a",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(74, 11, 30, 0.10)",
        premium: "0 24px 80px rgba(26, 26, 26, 0.12)",
        glow: "0 0 0 6px rgba(212, 175, 55, 0.18), 0 26px 80px rgba(74, 11, 30, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;

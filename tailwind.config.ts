import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#f4f1e8",
          100: "#d9e2f2",
          600: "#12264f",
          700: "#0f2146",
          900: "#0b1a33",
        },
        gold: {
          50: "#fff8df",
          100: "#f7e7a6",
          400: "#ead072",
          500: "#d4af37",
          600: "#d4af37",
          700: "#a98116",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(0, 0, 0, 0.20)",
        premium: "0 24px 80px rgba(0, 0, 0, 0.28)",
        glow: "0 0 0 4px rgba(212, 175, 55, 0.24), 0 18px 56px rgba(212, 175, 55, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

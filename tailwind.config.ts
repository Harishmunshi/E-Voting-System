import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royal: {
          50: "#eef5ff",
          100: "#d9e8ff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#172554",
        },
        gold: {
          100: "#fff0c2",
          400: "#f7c948",
          500: "#d9a441",
          700: "#96621a",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 37, 84, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;

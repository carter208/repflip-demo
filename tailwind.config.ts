import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#020810",
          900: "#040d21",
          800: "#071230",
          700: "#0a1a3e",
          600: "#0f2251",
          500: "#162d6b",
        },
        brand: {
          blue: "#2563eb",
          "blue-light": "#3b82f6",
          "blue-glow": "#60a5fa",
          cyan: "#06b6d4",
        },
        tier: {
          bronze: "#cd7f32",
          "bronze-light": "#e8a05a",
          silver: "#9ca3af",
          "silver-light": "#d1d5db",
          gold: "#f59e0b",
          "gold-light": "#fbbf24",
          platinum: "#e2e8f0",
          "platinum-light": "#f8fafc",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.25) 0%, transparent 70%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
      },
      boxShadow: {
        "blue-glow": "0 0 40px rgba(37,99,235,0.2)",
        "card-glow": "0 4px 24px rgba(0,0,0,0.4)",
        "score-ring": "0 0 0 6px rgba(37,99,235,0.15), 0 0 60px rgba(37,99,235,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;

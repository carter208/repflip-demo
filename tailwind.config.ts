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
        plum: {
          DEFAULT: "#2b1e30",
          raised: "#352738",
          sunken: "#221727",
        },
        stone: "#e6ddd0",
        hairline: "#4a3a52",
        ink: {
          DEFAULT: "#ece4de",
          muted: "#b09fb8",
        },
        gold: {
          DEFAULT: "#d4a24e",
          deep: "#b8883e",
        },
        tier: {
          bronze: "#b3703f",
          silver: "#a39aad",
          gold: "#d4a24e",
          platinum: "#c9bce0",
        },
        sage: "#8fa06a",
        rust: "#b3564a",
      },
      fontFamily: {
        serif: ["'Zilla Slab'", "Georgia", "serif"],
        sans: ["'Work Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

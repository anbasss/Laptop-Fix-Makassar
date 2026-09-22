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
        background: "#0A0A0F",
        foreground: "#FFFFFF",
        brand: {
          blue: {
            DEFAULT: "#2E5FE8",
            hover: "#224EC4",
            light: "#4B77FA",
            dark: "#1B40A6",
            glow: "rgba(46, 95, 232, 0.28)",
          },
          red: {
            DEFAULT: "#EE2D2D",
            hover: "#D91F1F",
            light: "#FF4D4D",
            dark: "#C41A1A",
            glow: "rgba(238, 45, 45, 0.25)",
          },
        },
        surface: {
          page: "#0A0A0F",
          panel: "#12141C",
          inner: "#0D0F16",
          hover: "#181B26",
          border: "rgba(255, 255, 255, 0.07)",
        },
        subtext: "#A0A8B8",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

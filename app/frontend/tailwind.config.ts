import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#06060a",
        card: "rgba(255, 255, 255, 0.03)",
        "card-border": "rgba(255, 255, 255, 0.08)",
        indigo: {
          DEFAULT: "#ff5b4a",
          bright: "#ff7a6a",
          tint: "rgba(255, 91, 74, 0.12)",
        },
        amber: {
          DEFAULT: "#f59e0b",
          tint: "rgba(245, 158, 11, 0.12)",
        },
        "text-primary": "rgba(255, 255, 255, 0.95)",
        "text-secondary": "rgba(255, 255, 255, 0.6)",
        "text-muted": "rgba(255, 255, 255, 0.45)",
        band: {
          high: "#ff5b4a",
          medium: "#f59e0b",
          low: "rgba(255, 255, 255, 0.5)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        cc: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;

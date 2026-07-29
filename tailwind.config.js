/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', "serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"DM Mono"', "monospace"],
        pixie: ['"TG PixieDust"', "cursive"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
        },
      },
      animation: {
        ticker: "ticker 75s linear infinite",
        "accordion-down": "accordion-down 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "accordion-up": "accordion-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          to: { height: "0", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

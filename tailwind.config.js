/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#6322FE",
        background: "#ffffff",
        foreground: "#1F1F1F",
        primary: {
          DEFAULT: "#6322FE",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#4ADE80",
          foreground: "#1F1F1F",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f8fafc",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#9D7EFD",
          foreground: "#1F1F1F",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1F1F1F",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1F1F1F",
        },
        brand: {
          purple: "#6322FE",
          green: "#4ADE80",
          lightPurple: "#9D7EFD",
          dark: "#1F1F1F",
          light: "#F9FAFB",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

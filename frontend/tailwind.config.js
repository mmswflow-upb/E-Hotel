/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      maxWidth: {
        "3xl": "48rem",
      },
      colors: {
        primary: {
          DEFAULT: "#1e3a8a",
          light: "#2563eb",
          dark: "#7c3aed",
          "dark-light": "#a78bfa",
        },
        secondary: "#333",
        danger: "#ff4444",
        success: "#2ecc71",
        warning: "#f1c40f",
        error: {
          DEFAULT: "#dc2626",
          light: "#ef4444",
        },
      },
      backgroundColor: {
        dark: {
          DEFAULT: "#1a1a1a",
          lighter: "#2d2d2d",
        },
      },
      textColor: {
        dark: {
          DEFAULT: "#ffffff",
          muted: "#a0a0a0",
        },
      },
    },
  },
  plugins: [],
};

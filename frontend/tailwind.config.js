/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        "3xl": "48rem",
      },
      colors: {
        primary: "#0b82ff",
        secondary: "#333",
        danger: "#ff4444",
        success: "#2ecc71",
        warning: "#f1c40f",
        error: "#e74c3c",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#05050A",
          dark: "#0A0A0F",
          cyan: "#00F2FF",
          purple: "#B026FF",
          red: "#FF0055",
        },
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "'Fira Code'", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
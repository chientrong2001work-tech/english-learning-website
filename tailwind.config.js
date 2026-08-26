/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Baloo 2'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eefcf5",
          100: "#d6f7e5",
          200: "#aeeecb",
          300: "#78dfab",
          400: "#42c988",
          500: "#20af6d",
          600: "#158d58",
          700: "#137048",
          800: "#13593b",
          900: "#114a32",
        },
      },
    },
  },
  plugins: [],
};

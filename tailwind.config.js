/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#1e1e22",
        lightText: "#f0f0f0",
        alertBg: "#731f22",
        cardBg: "#17181c",
      }
    },
  },
  plugins: [],
}

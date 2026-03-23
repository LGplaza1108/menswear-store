/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        sand: "#f4f1eb",
        line: "#dfdbd2"
      },
      boxShadow: {
        card: "0 18px 40px rgba(17, 17, 17, 0.07)"
      }
    }
  },
  plugins: []
};

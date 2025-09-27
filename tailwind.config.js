/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"], // Adjust paths as needed
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
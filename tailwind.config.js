/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EAB308',
          light: '#FEF08A',
          dark: '#A16207', 
        },
        surface: {
          DEFAULT: '#0F172A',
          paper: '#1E293B', 
          light: '#F8FAFC',
        },
      },
    },
    plugins: [],
  }
}
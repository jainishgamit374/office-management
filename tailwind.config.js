// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4289f4',
          dark: '#1472d6',
          light: '#6ba3f7',
        },
        secondary: {
          DEFAULT: '#ffe23d',
          dark: '#e6c800',
        },
        success: '#12df34',
        warning: '#ff9800',
        danger: '#f44336',
        info: '#2196f3',
        background: '#f0f2f5',
        leave: {
          privilege: '#4caf50',
          casual: '#2196f3',
          sick: '#ff9800',
          absent: '#f44336',
        },
        birthday: {
          bg: '#fef5e7',
          border: '#f9e79f',
          title: '#d4145a',
          profile: '#8e44ad',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
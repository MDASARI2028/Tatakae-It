/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6423C2',      // Deep Purple
        'secondary': '#7B3FE4',    // Lighter Purple
        'accent': '#06b6d4',       // Cyan
        'dark-bg': '#0f172a',      // Slate-900
        'card-bg': '#1e293b',      // Slate-800
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6423C2 0%, #7B3FE4 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
      },
    },
  },
  plugins: [],
}


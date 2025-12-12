/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6366f1',      // Indigo
        'secondary': '#8b5cf6',    // Violet
        'accent': '#06b6d4',       // Cyan
        'dark-bg': '#0f172a',      // Slate-900
        'card-bg': '#1e293b',      // Slate-800
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
      },
    },
  },
  plugins: [],
}


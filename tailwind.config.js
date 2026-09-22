/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Emerald Theme
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Gold / Amber Palette
        gold: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
          accent: '#d4af37',
          bright: '#f6d365',
        },
        // Royal Blue Palette (Voucher replica)
        royal: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0a192f',
          voucher: '#0088cc',
          voucherDark: '#006699',
        },
        // Obsidian Black Palette
        obsidian: {
          950: '#090a0f',
          900: '#0e1117',
          850: '#131722',
          800: '#1a1f2c',
          700: '#242b3d',
          600: '#323b53',
        }
      },
      fontFamily: {
        urdu: ['"Noto Nastaliq Urdu"', '"Amiri"', 'Gulzar', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', '"Noto Naskh Arabic"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.3)',
        'blue-glow': '0 0 25px -5px rgba(37, 99, 235, 0.35)',
        'green-glow': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'voucher': '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 136, 204, 0.2)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at 50% 50%, var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #f6d365 50%, #cca43b 100%)',
        'blue-voucher-gradient': 'linear-gradient(135deg, #0088cc 0%, #006699 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)',
      }
    },
  },
  plugins: [],
}

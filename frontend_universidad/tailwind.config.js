// tailwind.config.js - VERSIÓN MEJORADA
/** @type {import('tailwindcss').Config} */
export default { // <--- CAMBIADO A ESM
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal universitaria
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Azul principal
          600: '#2563eb',  // Azul universidad
          700: '#1d4ed8',  // Azul oscuro
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Colores académicos
        academic: {
          gold: '#f59e0b',    // Para destacados
          emerald: '#10b981', // Para éxito
          rose: '#f43f5e',    // Para alertas
          indigo: '#6366f1',  // Para enlaces
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 14px 0 rgba(0, 0, 0, 0.08)',
        'hard': '0 10px 28px rgba(0, 0, 0, 0.15)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          surface: 'var(--bg-surface)',
          hover: 'var(--bg-hover)',
        },
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          accent: 'rgba(99, 102, 241, 0.3)',
        },
        accent: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          cyan: '#06B6D4',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        status: {
          income: '#10B981',
          expense: '#F43F5E',
          warning: '#F59E0B',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 24px -4px rgba(99, 102, 241, 0.25)',
        'glow-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'card': 'var(--shadow-card)',
      }
    },
  },
  plugins: [],
}

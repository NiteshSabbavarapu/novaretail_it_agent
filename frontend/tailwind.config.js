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
        dark: {
          950: '#07090D', // Darkest background
          900: '#0D1117', // Main surface background
          850: '#12161E', // Elevated container
          800: '#161B22', // Card / component bg
          750: '#1C212A', // Hover state
          700: '#21262D', // Subtle border
          600: '#30363D', // Stronger border
          500: '#484F58', // Muted text/sub-borders
          400: '#8B949E', // Secondary text
          300: '#C9D1D9', // Primary body text
          200: '#E6EDF3', // Bright text
          100: '#F0F6FC', // Headings / high contrast
        },
        brand: {
          purple: '#8B5CF6',
          indigo: '#6366F1',
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
          skipped: '#6B7280',
          running: '#A855F7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px -5px rgba(139, 92, 246, 0.25)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.25)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.25)',
        'inner-dark': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}


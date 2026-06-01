import os

tailwind_config = """export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#0D9488',
          blue: '#2563EB',
        },
        theme: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
          darkbg: '#0F172A',
          darkcard: '#1E293B',
        },
        semantic: {
          success: '#16A34A',
          warning: '#EA580C',
          danger: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
"""

index_css = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-theme-bg text-theme-text font-sans antialiased;
  }
}
"""

with open('frontend/tailwind.config.js', 'w') as f:
    f.write(tailwind_config)

with open('frontend/src/index.css', 'w') as f:
    f.write(index_css)

print("Config and CSS updated")

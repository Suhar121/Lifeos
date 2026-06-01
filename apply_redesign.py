import os

files = {}

# 1. Update tailwind.config.js
files['frontend/tailwind.config.js'] = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1A6FE8",
          dark: "#0D4FB5",
        },
        accent: {
          teal: "#0EA5A0",
        },
        theme: {
          bg: "var(--theme-bg)",
          text: "var(--theme-text)",
          muted: "var(--theme-muted)",
        },
        navy: "var(--theme-bg)",
        navy2: "var(--theme-bg-alt)",
        glass: "var(--glass-bg)",
        "glass-border": "var(--glass-border)",
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        heading: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
}
"""

# 2. Update index.css
files['frontend/src/index.css'] = """@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* LIGHT THEME (Precise Care) */
  --theme-bg: #F7F9FC;
  --theme-bg-alt: #EEF3FB;
  --theme-text: #111827;
  --theme-muted: #4B5563;
  
  --glass-bg: #FFFFFF;
  --glass-bg-strong: #FFFFFF;
  --glass-border: #E8EDF5;
  --glass-border-strong: #E5E9F2;
  --glass-nav-bg: #FFFFFF;

  --clay-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  --clay-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
}

.dark {
  /* DARK THEME */
  --theme-bg: #0C1220;
  --theme-bg-alt: #141C2E;
  --theme-text: #F1F5F9;
  --theme-muted: #8896B3;
  
  --glass-bg: #141C2E;
  --glass-bg-strong: #1A2540;
  --glass-border: #243052;
  --glass-border-strong: #243052;
  --glass-nav-bg: #1A2540;

  --clay-shadow: 0 4px 16px rgba(0,0,0,0.2);
  --clay-shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  margin: 0;
  font-family: 'IBM Plex Sans', sans-serif;
  background-color: var(--theme-bg);
  color: var(--theme-text);
  min-height: 100vh;
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

h1, h2, h3, h4, h5, h6, .font-heading {
  font-family: 'DM Sans', sans-serif;
}

#root { position: relative; z-index: 1; }

.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--clay-shadow);
  border-radius: 12px;
}

.glass-nav {
  background: var(--glass-nav-bg);
  border-bottom: 1px solid var(--glass-border);
  border-right: 1px solid var(--glass-border);
}

.clay { box-shadow: var(--clay-shadow); }
.clay-sm { box-shadow: var(--clay-shadow-sm); }

.clay-btn {
  background: #1A6FE8 !important;
  color: #FFFFFF !important;
  border-radius: 8px;
  box-shadow: none;
  border: none;
  transition: transform 0.1s ease;
}
.clay-btn:active {
  transform: scale(0.98);
}
"""

for path, content in files.items():
    with open(path, 'w') as f:
        f.write(content)

print("Base setup applied!")

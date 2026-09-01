import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces (from Figma landing page)
        base: '#020617',
        surface: '#0f172a',
        'surface-raised': '#171f33',
        'surface-sunken': '#060e20',
        border: {
          DEFAULT: '#334155',
          subtle: 'rgba(66,71,84,0.2)',
        },
        // Text
        heading: '#dae2fd',
        body: '#c2c6d6',
        muted: '#8891ab',
        // Brand / accent
        accent: {
          DEFAULT: '#3b82f6',
          light: '#adc6ff',
          dark: '#001a42',
        },
        // Status
        success: '#4edea3',
        warning: '#facc15',
        danger: '#ffb4ab',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        glow: '0px 0px 10px rgba(59,130,246,0.4)',
        card: '0px 25px 50px -12px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;

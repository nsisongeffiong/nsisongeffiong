import type { Config } from 'tailwindcss'

const config: Config = {
  // next-themes now sets data-theme="dark", so Tailwind dark: variants
  // use the attribute selector instead of the .dark class
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Note: --font-cormorant now points to Fraunces (see layout.tsx)
        cormorant:     ['var(--font-cormorant)', 'serif'],
        syne:          ['var(--font-syne)', 'sans-serif'],
        // Note: --font-dm-mono now points to JetBrains Mono (see layout.tsx)
        mono:          ['var(--font-dm-mono)', 'monospace'],
        'source-serif': ['var(--font-source-serif)', 'serif'],
      },
      colors: {
        light: {
          bg:    '#F4F1EA',
          bg2:   '#EEEAE0',
          bg3:   '#E5DFD1',
          txt:   '#1A1A17',
          txt2:  '#53524C',
          txt3:  '#8E8C82',
        },
        dark: {
          bg:    '#0D0E0C',
          bg2:   '#151613',
          bg3:   '#1C1D1A',
          txt:   '#F0EEE3',
          txt2:  '#A8A69B',
          txt3:  '#6E6C62',
        },
      },
      typography: {
        DEFAULT: { css: { maxWidth: 'none' } },
      },
    },
  },
  plugins: [],
}

export default config

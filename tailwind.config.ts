import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'serif'],
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
        'source-serif': ['var(--font-source-serif)', 'serif'],
      },
      colors: {
        // Light mode palette
        light: {
          bg:          '#F7F5F0',
          bg2:         '#EEEAE0',
          bg3:         '#E5E0D4',
          txt:         '#1C1C18',
          txt2:        '#5C5B54',
          txt3:        '#9C9B90',
        },
        // Dark mode palette
        dark: {
          bg:          '#0E0E0C',
          bg2:         '#181815',
          bg3:         '#1E1E1A',
          txt:         '#F0EFE8',
          txt2:        '#A8A89E',
          txt3:        '#606058',
        },
        // Accent colours — consistent across modes
        purple: {
          DEFAULT:     '#534AB7',
          bg:          '#EEEDFE',
          txt:         '#3C3489',
          acc:         '#AFA9EC',
          dark:        '#AFA9EC',
          'dark-bg':   '#26215C',
          'dark-txt':  '#CECBF6',
        },
        teal: {
          hero:        '#04342C',
          mid:         '#1D9E75',
          light:       '#5DCAA5',
          pale:        '#E1F5EE',
          txt:         '#085041',
          comm:        '#0F6E56',
        },
        amber: {
          DEFAULT:     '#BA7517',
          bg:          '#FDF6E8',
          txt:         '#7A4A0A',
          'pq-bg':     '#FDF0D4',
          'pq-txt':    '#5C3608',
          attr:        '#9A5C10',
          dark:        '#EF9F27',
          'dark-bg':   '#2C1D06',
          'dark-txt':  '#FAC775',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config

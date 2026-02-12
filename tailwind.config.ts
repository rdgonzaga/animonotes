import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#fafaf8',
        foreground: '#1a1a18',
        muted: '#8b8b86',
        'muted-foreground': '#5a5a54',
        border: '#e5e5e0',
        input: '#f5f5f2',
        ring: '#1a1a18',
        primary: {
          DEFAULT: '#1a1a18',
          foreground: '#fafaf8',
        },
        secondary: {
          DEFAULT: '#8b8b86',
          foreground: '#fafaf8',
        },
        accent: {
          DEFAULT: '#d4a574',
          foreground: '#1a1a18',
        },
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
    },
  },
  plugins: [],
};
export default config;

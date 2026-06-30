import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#322e2b',
          light: '#4a4542',
        },
        accent: {
          DEFAULT: '#c4e717',
          hover: '#b5d415',
        },
        secondary: '#8a7e53',
        surface: {
          bg: '#eeeeee',
          card: '#ffffff',
        },
        muted: '#6b6560',
        border: '#e5e2dd',
        success: '#27ae60',
        warning: '#f39c12',
        danger: '#c4523a',
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(50,46,43,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

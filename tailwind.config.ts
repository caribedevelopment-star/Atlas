import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        olive: {
          DEFAULT: 'hsl(var(--olive))',
          foreground: 'hsl(var(--olive-foreground))',
        },
        burgundy: {
          DEFAULT: 'hsl(var(--burgundy))',
          foreground: 'hsl(var(--burgundy-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 0.5rem)',
        sm: 'calc(var(--radius) - 0.75rem)',
      },
      boxShadow: {
        soft: '0 2px 20px -6px rgba(60, 55, 45, 0.12)',
        'soft-lg': '0 12px 40px -12px rgba(60, 55, 45, 0.18)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

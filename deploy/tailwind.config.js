/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      colors: {
        // Dark Theme - The Digital Atelier
        primary: {
          DEFAULT: '#c3c0ff',
          50: '#c3c0ff',
          100: '#e2dfff',
          200: '#c3c0ff',
          300: '#a5a1ff',
          400: '#7470d8',
          500: '#5551c2',
          600: '#4f46e5',
          700: '#4d44e3',
          800: '#3323cc',
          900: '#1d00a5',
          container: '#4f46e5',
          fixed: '#e2dfff',
          'fixed-dim': '#c3c0ff',
        },
        secondary: {
          DEFAULT: '#c0c1ff',
          container: '#3131c0',
          fixed: '#e1e0ff',
          'fixed-dim': '#c0c1ff',
        },
        surface: {
          DEFAULT: '#131313',
          dim: '#131313',
          bright: '#3a3939',
          container: '#201f1f',
          'container-low': '#1c1b1b',
          'container-lowest': '#0e0e0e',
          'container-high': '#2a2a2a',
          'container-highest': '#353534',
          variant: '#353534',
          tint: '#c3c0ff',
        },
        'on-surface': {
          DEFAULT: '#e5e2e1',
          variant: '#c7c4d8',
        },
        'on-primary': {
          DEFAULT: '#1d00a5',
          container: '#dad7ff',
          fixed: '#0f0069',
          'fixed-variant': '#3323cc',
        },
        'on-secondary': {
          DEFAULT: '#1000a9',
          container: '#b0b2ff',
          fixed: '#07006c',
          'fixed-variant': '#2f2ebe',
        },
        outline: {
          DEFAULT: '#918fa1',
          variant: '#464555',
        },
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        tertiary: {
          DEFAULT: '#bbc3ff',
          container: '#2346fa',
          fixed: '#dee0ff',
          'fixed-dim': '#bbc3ff',
        },
        inverse: {
          surface: '#e5e2e1',
          'on-surface': '#313030',
          primary: '#4d44e3',
        },
        background: '#131313',
        'on-background': '#e5e2e1',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'atelier': '0 10px 40px rgba(229, 226, 225, 0.05)',
        'atelier-lg': '0 40px 100px rgba(0, 0, 0, 0.4)',
        'glow-primary': '0 0 20px rgba(195, 192, 255, 0.4)',
        'glow-primary-sm': '0 0 15px rgba(195, 192, 255, 0.1)',
        'cta': '0 10px 30px rgba(79, 70, 229, 0.3)',
      },
      width: {
        'preview': '860px',
      },
      maxWidth: {
        'preview': '860px',
      },
    },
  },
  plugins: [],
};

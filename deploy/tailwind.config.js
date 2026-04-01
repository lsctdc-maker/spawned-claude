/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        headline: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        body: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
        label: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
      },
      colors: {
        // Toss-style Light Theme
        primary: {
          DEFAULT: '#3182F6',
          50: '#EBF4FF',
          100: '#D6E9FF',
          200: '#ADC8FF',
          300: '#6BA1FF',
          400: '#4593FC',
          500: '#3182F6',
          600: '#1B64DA',
          700: '#1554B8',
          800: '#0F4494',
          900: '#0A3070',
          container: '#3182F6',
          fixed: '#EBF4FF',
          'fixed-dim': '#3182F6',
        },
        secondary: {
          DEFAULT: '#8B95A1',
          container: '#F4F5F7',
          fixed: '#E5E8EB',
          'fixed-dim': '#8B95A1',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dim: '#F4F5F7',
          bright: '#FFFFFF',
          container: '#FFFFFF',
          'container-low': '#F9FAFB',
          'container-lowest': '#F4F5F7',
          'container-high': '#FFFFFF',
          'container-highest': '#FFFFFF',
          variant: '#F4F5F7',
          tint: '#EBF4FF',
        },
        'on-surface': {
          DEFAULT: '#191F28',
          variant: '#8B95A1',
        },
        'on-primary': {
          DEFAULT: '#FFFFFF',
          container: '#FFFFFF',
          fixed: '#FFFFFF',
          'fixed-variant': '#FFFFFF',
        },
        'on-secondary': {
          DEFAULT: '#4E5968',
          container: '#4E5968',
          fixed: '#333D4B',
          'fixed-variant': '#4E5968',
        },
        outline: {
          DEFAULT: '#D1D6DB',
          variant: '#E5E8EB',
        },
        error: {
          DEFAULT: '#F04452',
          container: '#FFF0F0',
        },
        tertiary: {
          DEFAULT: '#1B2559',
          container: '#1B2559',
          fixed: '#E8EAED',
          'fixed-dim': '#1B2559',
        },
        inverse: {
          surface: '#191F28',
          'on-surface': '#FFFFFF',
          primary: '#3182F6',
        },
        background: '#FFFFFF',
        'on-background': '#191F28',
        'on-error': '#FFFFFF',
        'on-error-container': '#F04452',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'atelier': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'atelier-lg': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'glow-primary': '0 0 0 3px rgba(49, 130, 246, 0.15)',
        'glow-primary-sm': '0 0 0 2px rgba(49, 130, 246, 0.1)',
        'cta': '0 4px 14px rgba(27, 37, 89, 0.2)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'float': '0 8px 30px rgba(0, 0, 0, 0.12)',
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

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#f4f2ec',
        panel: '#ffffff',
        elevated: '#f5f4ef',
        input: '#faf9f5',
        cyan: {
          DEFAULT: '#a5361d',
          dim: 'rgba(165, 54, 29, 0.15)',
        },
        radar: {
          DEFAULT: '#21604e',
          dim: 'rgba(33, 96, 78, 0.15)',
        },
        amber: {
          DEFAULT: '#8b530b',
          dim: 'rgba(139, 83, 11, 0.15)',
        },
        critical: {
          DEFAULT: '#a52728',
          dim: 'rgba(165, 39, 40, 0.15)',
        },
        primary: '#1e252a',
        muted: '#515b63',
        faint: '#626d74',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        subtle: 'rgba(67, 71, 64, 0.16)',
        default: 'rgba(67, 71, 64, 0.24)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        panel: '0 2px 8px rgba(31, 37, 42, 0.05)',
        elevated: '0 4px 16px rgba(31, 37, 42, 0.09)',
        glow: '0 0 20px rgba(165, 54, 29, 0.15)',
      },
    },
  },
  plugins: [],
};

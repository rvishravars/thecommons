/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  safelist: [
    // Safelist all phase color variants for dynamic class names
    'border-spark-500',
    'border-spark-600',
    'bg-spark-600',
    'bg-spark-700',
    'bg-spark-900/20',
    'text-spark-300',
    'text-spark-400',
    'ring-spark-500',
    'hover:text-spark-300',
    'hover:bg-spark-600/20',
    'hover:bg-spark-700',
    'focus:ring-spark-500',
    'border-design-500',
    'border-design-600',
    'bg-design-600',
    'bg-design-700',
    'bg-design-900/20',
    'text-design-300',
    'text-design-400',
    'ring-design-500',
    'hover:text-design-300',
    'hover:bg-design-600/20',
    'hover:bg-design-700',
    'focus:ring-design-500',
    'border-logic-500',
    'border-logic-600',
    'bg-logic-600',
    'bg-logic-700',
    'bg-logic-900/20',
    'text-logic-300',
    'text-logic-400',
    'ring-logic-500',
    'hover:text-logic-300',
    'hover:bg-logic-600/20',
    'hover:bg-logic-700',
    'focus:ring-logic-500',
  ],
  theme: {
    extend: {
      colors: {
        spark: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          300: '#4da6ff',
          400: '#3399ff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          900: '#001a33',
        },
        design: {
          50: '#fff9e6',
          100: '#fff0b3',
          300: '#ffe066',
          400: '#ffd633',
          500: '#ffcc00',
          600: '#cca300',
          700: '#997a00',
          900: '#332800',
        },
        logic: {
          50: '#e6f7ed',
          100: '#b3e6cc',
          300: '#66e699',
          400: '#33dd88',
          500: '#00cc66',
          600: '#00a352',
          700: '#007a3d',
          900: '#002614',
        },
        commons: {
          dark: '#1a1a2e',
          darker: '#16161f',
          light: '#eaeaea',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray[300]'),
            '--tw-prose-headings': theme('colors.commons.light'),
            '--tw-prose-links': theme('colors.design[500]'),
            '--tw-prose-code': theme('colors.spark[400]'),
            '--tw-prose-quotes': theme('colors.gray[400]'),
          }
        }
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

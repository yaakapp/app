const plugin = require('tailwindcss/plugin');

const height = {
  '2xs': '1.5rem',
  xs: '1.75rem',
  sm: '2.0rem',
  md: '2.5rem',
};

/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ['class', '[data-resolved-appearance="dark"]'],
  content: ['./index.html', './src-web/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      opacity: {
        disabled: '0.3',
      },
      fontSize: {
        xs: '0.8rem',
      },
      height,
      minHeight: height,
      lineHeight: {
        // HACK: Minus 2 to account for borders inside inputs
        xs: 'calc(1.75rem - 2px)',
        sm: 'calc(2.0rem - 2px)',
        md: 'calc(2.5rem - 2px)',
      },
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen-Sans',
        'Ubuntu',
        'Cantarell',
        'Helvetica Neue',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
      ],
    },
    fontSize: {
      '4xs': '0.6rem',
      '3xs': '0.675rem',
      '2xs': '0.75rem',
      'xs': '0.8rem',
      'sm': '0.9rem',
      'base': '1rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
      '5xl': '3rem',
    },
    colors: {
      'transparent': 'transparent',
      'placeholder': 'var(--fg-subtler)',
      'selection': 'var(--background-selection)',

      // New theme values

      'border-focus': 'var(--border-focus)',
      'fg': 'var(--fg)',
      'fg-danger': 'var(--fg-danger)',
      'fg-subtle': 'var(--fg-subtle)',
      'fg-subtler': 'var(--fg-subtler)',
      'fg-primary': 'var(--fg-primary)',
      'fg-secondary': 'var(--fg-secondary)',
      'fg-success': 'var(--fg-success)',
      'fg-info': 'var(--fg-info)',
      'fg-notice': 'var(--fg-notice)',
      'fg-warning': 'var(--fg-warning)',
      'background': 'var(--background)',
      'background-active': 'var(--background-active)',
      'background-highlight': 'var(--background-highlight)',
      'background-highlight-secondary': 'var(--background-highlight-secondary)',
      'background-backdrop': 'var(--background-backdrop)',
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    plugin(function ({addVariant}) {
      addVariant('hocus', ['&:hover', '&:focus-visible', '&.focus:focus']);
      addVariant('focus-visible-or-class', ['&:focus-visible']);
    }),
  ],
};

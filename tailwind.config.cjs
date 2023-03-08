/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class', '[data-appearance="dark"]'],
    content: [
        "./index.html",
        "./src-web/**/*.{html,tsx}",
    ],
    theme: {
        extend: {},
        fontFamily: {
            'mono': ['JetBrains Mono', "Menlo", 'monospace'],
        },
        borderRadius: {
            none: '0px',
            sm: 'var(--border-radius-sm)',
            DEFAULT: 'var(--border-radius)',
            md: 'var(--border-radius-md)',
            lg: 'var(--border-radius-lg)',
            full: '9999px',
        },
        colors: {
            transparent: 'transparent',
            white: 'hsl(0 100% 100% / <alpha-value>)',
            black: 'hsl(0 100% 0% / <alpha-value>)',
            background: 'hsl(var(--color-background) / <alpha-value>)',
            placeholder: 'hsl(var(--color-gray-300) / <alpha-value>)',
            red: color('red'),
            orange: color('orange'),
            yellow: color('yellow'),
            gray: color('gray'),
            blue: color('blue'),
            green: color('green'),
            pink: color('pink'),
            violet: color('violet'),
        }
    },
    plugins: [],
}

function color(name) {
    return {
        50: `hsl(var(--color-${name}-50) / <alpha-value>)`,
        100: `hsl(var(--color-${name}-100) / <alpha-value>)`,
        200: `hsl(var(--color-${name}-200) / <alpha-value>)`,
        300: `hsl(var(--color-${name}-300) / <alpha-value>)`,
        400: `hsl(var(--color-${name}-400) / <alpha-value>)`,
        500: `hsl(var(--color-${name}-500) / <alpha-value>)`,
        600: `hsl(var(--color-${name}-600) / <alpha-value>)`,
        700: `hsl(var(--color-${name}-700) / <alpha-value>)`,
        800: `hsl(var(--color-${name}-800) / <alpha-value>)`,
        900: `hsl(var(--color-${name}-900) / <alpha-value>)`,
        950: `hsl(var(--color-${name}-950) / <alpha-value>)`,
    };
}

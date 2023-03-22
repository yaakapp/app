const height = {
  "xs": "1.5rem",
  "sm": "2rem",
  "md": "2.5rem"
};

/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class", "[data-appearance=\"dark\"]"],
  content: [
    "./index.html",
    "./src-web/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      opacity: {
        "disabled": "0.3"
      },
      height,
      lineHeight: height
    },
    fontFamily: {
      "mono": ["JetBrains Mono", "Menlo", "monospace"],
      "sans": ["Inter", "sans-serif"]
    },
    fontSize: {
      sm: "0.9rem",
      base: "1rem",
      xl: "1.25rem",
      "2xl": "1.563rem",
      "3xl": "1.953rem",
      "4xl": "2.441rem",
      "5xl": "3.052rem"
    },
    colors: {
      selection: "hsl(var(--color-violet-500) / 0.4)",
      focus: "hsl(var(--color-blue-500) / 0.6)",
      invalid: "hsl(var(--color-red-500))",
      highlight: "hsl(var(--color-gray-300) / 0.35)",
      highlightSecondary: "hsl(var(--color-gray-300) / 0.2)",
      transparent: "transparent",
      white: "hsl(0 100% 100% / <alpha-value>)",
      black: "hsl(0 100% 0% / <alpha-value>)",
      placeholder: "hsl(var(--color-gray-400) / <alpha-value>)",
      red: color("red"),
      orange: color("orange"),
      yellow: color("yellow"),
      gray: color("gray"),
      blue: color("blue"),
      green: color("green"),
      pink: color("pink"),
      violet: color("violet")
    }
  },
  plugins: [
    require("@tailwindcss/container-queries")
  ]
};

function color(name) {
  return {
    0: `hsl(var(--color-${name}-0) / <alpha-value>)`,
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
    1000: `hsl(var(--color-${name}-1000) / <alpha-value>)`
  };
}

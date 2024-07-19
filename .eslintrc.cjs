module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@typescript-eslint/recommended",
    "eslint-config-prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"]
  },
  ignorePatterns: ["scripts/**/*", "plugin-runtime/**/*", "src-tauri/**/*", "plugins/**/*", "checkout/**/*"],
  settings: {
    react: {
      version: "detect"
    },
    "import/resolver": {
      node: {
        paths: ["src-web"],
        extensions: [".ts", ".tsx"]
      }
    }
  },
  rules: {
    "jsx-a11y/no-autofocus": "off",
    "react/react-in-jsx-scope": "off",
    "import/no-unresolved": "off",
    "@typescript-eslint/consistent-type-imports": ["error", {
      prefer: "type-imports",
      disallowTypeAnnotations: true,
      fixStyle: "separate-type-imports"
    }]
  }
};

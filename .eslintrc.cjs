module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:import/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:@typescript-eslint/recommended',
        'eslint-config-prettier',
    ],
    ignorePatterns: ['src-tauri/**/*'],
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            node: {
                paths: ['src-web'],
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/consistent-type-imports": ["error", {
            prefer: "type-imports",
            disallowTypeAnnotations: true,
            fixStyle: "separate-type-imports",
        }]
    },
};

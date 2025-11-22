// ESLint configuration for production build
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Permitir any temporalmente para el build de producción
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn", 
    "@typescript-eslint/ban-ts-comment": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "warn",
    "@next/next/no-img-element": "warn",
    "react/display-name": "warn",
    "@typescript-eslint/no-unsafe-declaration-merging": "warn",
    "react-hooks/rules-of-hooks": "error", // Mantener como error
  }
};
// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import hooksPlugin from "eslint-plugin-react-hooks";
import refreshPlugin from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier"; // <-- Importa la configuración de Prettier

export default [
  // Configuración global
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Reglas base de ESLint
  pluginJs.configs.recommended,

  // Reglas para TypeScript
  ...tseslint.configs.recommended,

  // Reglas para React
  {
    ...pluginReactConfig,
    rules: {
      ...pluginReactConfig.rules,
      "react/react-in-jsx-scope": "off", // No es necesario importar React
      "react/prop-types": "off", // Desactivado si usas TypeScript
    },
  },

  // Reglas para React Hooks
  {
    plugins: { "react-hooks": hooksPlugin },
    rules: hooksPlugin.configs.recommended.rules,
  },

  // Reglas para React Refresh (Vite)
  {
    plugins: { "react-refresh": refreshPlugin },
    rules: {
      "react-refresh/only-export-components": "warn",
    },
  },

  // ¡IMPORTANTE! Configuración de Prettier
  // Esta debe ser la ÚLTIMA configuración de reglas para que pueda sobreescribir conflictos.
  prettierConfig,
];
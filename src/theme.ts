// =================================================================================================
// ARCHIVO: src/theme.ts
// =================================================================================================

import { createTheme } from '@mui/material/styles';

// 1. Importamos las fuentes directamente en nuestro CSS-in-JS
import '@fontsource/montserrat/700.css'; // Para los títulos
import '@fontsource/roboto/400.css';  // Para el cuerpo de texto
import '@fontsource/roboto/500.css';  // Una variante de peso si la necesitas

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1',
    },
    secondary: {
      main: '#D32F2F',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Montserrat", "sans-serif"', fontWeight: 700, color: '#0D47A1' },
    h2: { fontFamily: '"Montserrat", "sans-serif"', fontWeight: 700, color: '#0D47A1' },
    h3: { fontFamily: '"Montserrat", "sans-serif"', fontWeight: 700, color: '#0D47A1' },
    h4: { fontFamily: '"Montserrat", "sans-serif"', fontWeight: 700, color: '#0D47A1' },
    h5: { fontFamily: '"Montserrat", "sans-serif"', fontWeight: 700 },
    h6: { fontFamily: '"Montserrat", "sans-serif"', fontWeight: 700 },
  },
});

export default theme;
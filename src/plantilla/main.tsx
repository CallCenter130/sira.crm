// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App.tsx'; // Asegúrate de que apunte a App.tsx

import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import appTheme from '../theme.ts'; 


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
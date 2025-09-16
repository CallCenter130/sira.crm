// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardPage from '../pages/DashboardPage';
import NewCasePage from '../pages/NewCasePage';

function App() {
  return (
    <Routes>
      {/* Todas las rutas anidadas dentro de Layout compartirán su estructura visual */}
      <Route path="/" element={<Layout />}>
        {/* La ruta "index" es la que se muestra por defecto en "/" */}
        <Route index element={<DashboardPage />} />
        <Route path="formulario" element={<NewCasePage />} />
        {/* Puedes añadir la página de búsqueda aquí cuando la crees */}
        {/* <Route path="buscar" element={<SearchPage />} /> */}

        {/* Ruta para manejar páginas no encontradas */}
        <Route path="*" element={<h1>404: Página No Encontrada</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
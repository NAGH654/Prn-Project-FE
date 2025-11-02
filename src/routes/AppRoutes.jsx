import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@layout/MainLayout';
import HomePage from '@pages/HomePage';

/**
 * Application Routes Configuration
 * Defines all routes and their corresponding components
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout Route */}
        <Route element={<MainLayout />}>
          {/* Home Page */}
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;


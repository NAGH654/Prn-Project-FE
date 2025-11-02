import { Outlet } from 'react-router-dom';
import '@/App.css';

/**
 * Main Layout Component
 * Wraps all pages with common header and structure
 */
const MainLayout = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📝 Assignment Submission System</h1>
        <p>Upload student submissions and view extracted images</p>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;


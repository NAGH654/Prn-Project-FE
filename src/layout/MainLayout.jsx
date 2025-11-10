import { Link, Outlet, useLocation } from 'react-router-dom';
import '@/App.css';

/**
 * Main Layout Component
 * Wraps all pages with common header and structure
 */
const MainLayout = () => {
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📝 Assignment Submission System</h1>
        <p>Upload student submissions and view extracted images</p>
        <nav style={{ marginTop: 12 }}>
          <Link className={`tab ${isActive('/')}`} to="/">Upload</Link>
          <Link className={`tab ${isActive('/reports')}`} to="/reports" style={{ marginLeft: 8 }}>Reports</Link>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;


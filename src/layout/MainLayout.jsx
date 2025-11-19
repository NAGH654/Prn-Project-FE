import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import '@/App.css';

/**
 * Main Layout Component
 * Wraps all pages with common header and structure
 */
const MainLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header__top">
          <div>
            <h1>📝 Assignment Submission System</h1>
            <p>Upload student submissions and view extracted images</p>
          </div>
          <div className="user-info">
            <span className="user-pill">
              {user?.username || 'Unknown'} • {user?.role || 'N/A'}
            </span>
            <button type="button" className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
        <nav style={{ marginTop: 12 }}>
          <Link className={`tab ${isActive('/')}`} to="/">Upload</Link>
          <Link className={`tab ${isActive('/reports')}`} to="/reports" style={{ marginLeft: 8 }}>
            Reports
          </Link>
          <Link className={`tab ${isActive('/grading')}`} to="/grading" style={{ marginLeft: 8 }}>
            Grading
          </Link>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;


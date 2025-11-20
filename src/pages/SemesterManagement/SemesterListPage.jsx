import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import semesterService from '@services/semester';
import './SemesterManagement.css';

const SemesterListPage = () => {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await semesterService.getAll();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (semesterId, semesterName) => {
    if (!window.confirm(`Are you sure you want to delete "${semesterName}"?`)) {
      return;
    }

    try {
      await semesterService.deleteSemester(semesterId);
      await loadSemesters();
    } catch (err) {
      alert(err.message || 'Failed to delete semester');
    }
  };

  const filteredSemesters = semesters.filter(
    (semester) =>
      (semester.name || semester.semesterName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (semester.code || semester.semesterCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="management-page">
        <div className="management-card">
          <p>Loading semesters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="management-header">
        <h1>Semester Management</h1>
        <button className="primary-btn" onClick={() => navigate('/semesters/create')}>
          + Create New Semester
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={loadSemesters}>Retry</button>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search semesters by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="management-list">
        {filteredSemesters.length === 0 ? (
          <div className="management-card">
            <p>{searchTerm ? 'No semesters found matching your search.' : 'No semesters found. Create your first semester!'}</p>
          </div>
        ) : (
          filteredSemesters.map((semester) => (
            <div key={semester.id || semester.semesterId} className="management-card">
              <div className="card-header">
                <div>
                  <h3>{semester.name || semester.semesterName}</h3>
                  {semester.code && <p className="code-badge">{semester.code || semester.semesterCode}</p>}
                </div>
                {semester.isActive !== undefined && (
                  <span className={`status-pill ${semester.isActive ? 'status-active' : 'status-inactive'}`}>
                    {semester.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>

              <div className="card-body">
                {semester.startDate && semester.endDate && (
                  <p className="muted">
                    {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/semesters/${semester.id || semester.semesterId}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="danger-btn"
                  onClick={() => handleDelete(semester.id || semester.semesterId, semester.name || semester.semesterName)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SemesterListPage;


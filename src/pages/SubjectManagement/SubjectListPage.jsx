import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import subjectService from '@services/subject';
import './SubjectManagement.css';

const SubjectListPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subjectService.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete "${subjectName}"?`)) {
      return;
    }

    try {
      await subjectService.deleteSubject(subjectId);
      await loadSubjects();
    } catch (err) {
      alert(err.message || 'Failed to delete subject');
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      (subject.name || subject.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.code || subject.subjectCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="management-page">
        <div className="management-card">
          <p>Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="management-header">
        <h1>Subject Management</h1>
        <button className="primary-btn" onClick={() => navigate('/subjects/create')}>
          + Create New Subject
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={loadSubjects}>Retry</button>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search subjects by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="management-list">
        {filteredSubjects.length === 0 ? (
          <div className="management-card">
            <p>{searchTerm ? 'No subjects found matching your search.' : 'No subjects found. Create your first subject!'}</p>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div key={subject.id || subject.subjectId} className="management-card">
              <div className="card-header">
                <div>
                  <h3>{subject.name || subject.subjectName}</h3>
                  <p className="code-badge">{subject.code || subject.subjectCode}</p>
                </div>
              </div>

              {subject.description && (
                <div className="card-body">
                  <p className="muted">{subject.description}</p>
                </div>
              )}

              {subject.credits && (
                <div className="card-body">
                  <p className="muted">Credits: {subject.credits}</p>
                </div>
              )}

              <div className="card-actions">
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/subjects/${subject.id || subject.subjectId}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="danger-btn"
                  onClick={() => handleDelete(subject.id || subject.subjectId, subject.name || subject.subjectName)}
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

export default SubjectListPage;


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '@services/session';
import examService from '@services/exam';
import './SessionManagement.css';

const SessionListPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterActive, setFilterActive] = useState(false);
  const [filterExam, setFilterExam] = useState('');
  const [exams, setExams] = useState([]);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    loadSessions();
  }, [filterActive, filterExam]);

  const loadExams = async () => {
    try {
      const data = await examService.getAllExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load exams:', err);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      
      if (filterActive) {
        data = await sessionService.getActive();
      } else if (filterExam) {
        data = await sessionService.getByExamId(filterExam);
      } else {
        data = await sessionService.getAll();
      }
      
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId, sessionName) => {
    if (!window.confirm(`Are you sure you want to delete "${sessionName}"?`)) {
      return;
    }

    try {
      await sessionService.delete(sessionId);
      await loadSessions();
    } catch (err) {
      alert(err.message || 'Failed to delete session');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="session-management-page">
        <div className="session-card">
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-management-page">
      <div className="session-header">
        <h1>Session Management</h1>
        <button
          className="primary-btn"
          onClick={() => navigate('/sessions/create')}
        >
          + Create New Session
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="session-filters">
        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filterActive}
              onChange={(e) => setFilterActive(e.target.checked)}
            />
            Show Active Only
          </label>
        </div>
        <div className="filter-group">
          <label>
            Filter by Exam:
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
            >
              <option value="">All Exams</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title || exam.examName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="secondary-btn" onClick={loadSessions}>
          Refresh
        </button>
      </div>

      <div className="session-list">
        {sessions.length === 0 ? (
          <div className="session-card">
            <p>No sessions found.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-card-header">
                <h3>{session.sessionName}</h3>
                <div className="session-status">
                  <span className={`status-badge ${session.isActive ? 'active' : 'inactive'}`}>
                    {session.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="session-card-body">
                <div className="session-info">
                  <div className="info-item">
                    <strong>Exam:</strong> {session.examTitle || 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>Scheduled Date:</strong> {formatDate(session.scheduledDate)}
                  </div>
                  <div className="info-item">
                    <strong>Location:</strong> {session.location || 'N/A'}
                  </div>
                  <div className="info-item">
                    <strong>Max Students:</strong> {session.maxStudents}
                  </div>
                  <div className="info-item">
                    <strong>Examiners:</strong> {session.examinerAssignmentsCount || 0}
                  </div>
                </div>
                <div className="session-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => navigate(`/sessions/${session.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={() => navigate(`/sessions/${session.id}/examiners`)}
                  >
                    Manage Examiners
                  </button>
                  <button
                    className="danger-btn"
                    onClick={() => handleDelete(session.id, session.sessionName)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionListPage;


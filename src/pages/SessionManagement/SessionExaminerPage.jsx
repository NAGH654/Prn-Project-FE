import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionService } from '@services/session';
import './SessionManagement.css';

const SessionExaminerPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [examiners, setExaminers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examinerSearch, setExaminerSearch] = useState('');
  const [newExaminerId, setNewExaminerId] = useState('');
  const [newExaminerRole, setNewExaminerRole] = useState('Examiner');

  useEffect(() => {
    loadSession();
    // TODO: Load examiners from API when available
    // For now, using placeholder
    loadExaminers();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await sessionService.getById(sessionId);
      setSession(sessionData);
      // TODO: Load assignments from session data when available
      setAssignments([]);
    } catch (err) {
      setError(err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const loadExaminers = async () => {
    // TODO: Replace with actual API call when examiner service is available
    // For now, using placeholder data
    setExaminers([]);
  };

  const handleAssignExaminer = async () => {
    if (!newExaminerId.trim()) {
      alert('Please enter an examiner ID');
      return;
    }

    try {
      setLoading(true);
      await sessionService.assignExaminer(sessionId, newExaminerId, newExaminerRole);
      await loadSession();
      setNewExaminerId('');
      setNewExaminerRole('Examiner');
      alert('Examiner assigned successfully');
    } catch (err) {
      alert(err.message || 'Failed to assign examiner');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (examinerId) => {
    if (!window.confirm('Are you sure you want to remove this examiner assignment?')) {
      return;
    }

    try {
      setLoading(true);
      await sessionService.removeExaminer(sessionId, examinerId);
      await loadSession();
    } catch (err) {
      alert(err.message || 'Failed to remove examiner assignment');
    } finally {
      setLoading(false);
    }
  };

  const filteredExaminers = examiners.filter((examiner) =>
    examiner.name?.toLowerCase().includes(examinerSearch.toLowerCase()) ||
    examiner.email?.toLowerCase().includes(examinerSearch.toLowerCase()) ||
    examiner.id?.toLowerCase().includes(examinerSearch.toLowerCase())
  );

  if (loading && !session) {
    return (
      <div className="session-management-page">
        <div className="session-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-management-page">
      <div className="session-header">
        <h1>Manage Examiners - {session?.sessionName || 'Session'}</h1>
        <button className="secondary-btn" onClick={() => navigate('/sessions')}>
          ← Back to Sessions
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {session && (
        <div className="session-card">
          <div className="session-info">
            <div className="info-item">
              <strong>Exam:</strong> {session.examTitle || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Scheduled Date:</strong>{' '}
              {session.scheduledDate
                ? new Date(session.scheduledDate).toLocaleString()
                : 'N/A'}
            </div>
            <div className="info-item">
              <strong>Location:</strong> {session.location || 'N/A'}
            </div>
          </div>
        </div>
      )}

      <div className="assignment-section">
        <h3>Assign New Examiner</h3>
        <div className="form-group">
          <label htmlFor="examinerId">Examiner ID</label>
          <input
            type="text"
            id="examinerId"
            value={newExaminerId}
            onChange={(e) => setNewExaminerId(e.target.value)}
            placeholder="Enter examiner ID (UUID)"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="examinerRole">Role</label>
          <select
            id="examinerRole"
            value={newExaminerRole}
            onChange={(e) => setNewExaminerRole(e.target.value)}
            className="form-select"
          >
            <option value="Examiner">Examiner</option>
            <option value="Lead Examiner">Lead Examiner</option>
            <option value="Observer">Observer</option>
          </select>
        </div>
        <button
          className="primary-btn"
          onClick={handleAssignExaminer}
          disabled={loading || !newExaminerId.trim()}
        >
          Assign Examiner
        </button>
      </div>

      <div className="assignment-section">
        <h3>Available Examiners</h3>
        <input
          type="text"
          placeholder="Search examiners by name, email, or ID..."
          value={examinerSearch}
          onChange={(e) => setExaminerSearch(e.target.value)}
          className="form-input"
        />

        <div className="examiner-list">
          {filteredExaminers.length === 0 ? (
            <p className="muted">
              No examiners found. You may need to create examiners first or load them from an API.
            </p>
          ) : (
            filteredExaminers.map((examiner) => (
              <div key={examiner.id || examiner.userId} className="examiner-item">
                <div>
                  <strong>{examiner.name || examiner.username || examiner.id}</strong>
                  <p className="muted">{examiner.email || 'No email'}</p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => {
                    setNewExaminerId(examiner.id || examiner.userId);
                    handleAssignExaminer();
                  }}
                  disabled={loading}
                >
                  Assign
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="assignment-section">
        <h3>Assigned Examiners</h3>
        {assignments.length === 0 ? (
          <p className="muted">No examiners assigned yet.</p>
        ) : (
          <div className="assignment-list">
            {assignments.map((assignment) => (
              <div key={assignment.examinerId} className="assignment-item">
                <div>
                  <strong>{assignment.examinerName || assignment.examinerId}</strong>
                  <p className="muted">Role: {assignment.role || 'Examiner'}</p>
                </div>
                <button
                  className="danger-btn"
                  onClick={() => handleRemoveAssignment(assignment.examinerId)}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionExaminerPage;


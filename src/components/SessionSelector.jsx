import { useState, useEffect } from 'react';
import { apiService } from '@services/api';
import './SessionSelector.css';

export default function SessionSelector({ onSessionChange, onExamChange }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllSessions();
      setSessions(data);
      if (data.length > 0) {
        const first = data[0];
        const sessionId = first.id || first.sessionId;
        setSelectedSessionId(sessionId);
        onSessionChange?.(sessionId);
        if (first.examId) onExamChange?.(first.examId);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const sessionId = e.target.value;
    setSelectedSessionId(sessionId);
    onSessionChange?.(sessionId);
    const selected = sessions.find(s => (s.id || s.sessionId) === sessionId);
    if (selected?.examId) onExamChange?.(selected.examId);
  };

  if (loading) {
    return (
      <div className="session-selector">
        <label>Loading sessions...</label>
      </div>
    );
  }

  if (error) {
    return (
      <div className="session-selector">
        <label>Session</label>
        <div className="error-message">Error: {error}</div>
        <button onClick={loadSessions} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="session-selector">
        <label>Session</label>
        <div className="empty-message">No sessions found</div>
      </div>
    );
  }

  return (
    <div className="session-selector">
      <label htmlFor="session-select">Select Exam Session (for upload)</label>
      <select
        id="session-select"
        value={selectedSessionId}
        onChange={handleChange}
        className="session-select"
      >
        {sessions.map((session) => {
          const isActive = session.isActive;
          const status = isActive ? '✓' : '✗';
          const sessionId = session.id || session.sessionId;
          const examName = session.examTitle || session.examName || '';
          const sessionName = session.sessionName || '';
          const scheduledDate = session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : 'Invalid Date';
          return (
            <option key={sessionId} value={sessionId}>
              {status} {examName} - {sessionName} ({scheduledDate})
            </option>
          );
        })}
      </select>
    </div>
  );
}

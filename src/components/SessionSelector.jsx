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
        setSelectedSessionId(first.sessionId);
        onSessionChange?.(first.sessionId);
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
    const selected = sessions.find(s => s.sessionId === sessionId);
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
          return (
            <option key={session.sessionId} value={session.sessionId}>
              {status} {session.examName} - {session.sessionName} ({new Date(session.startTime).toLocaleDateString()} - {new Date(session.endTime).toLocaleDateString()})
            </option>
          );
        })}
      </select>
    </div>
  );
}

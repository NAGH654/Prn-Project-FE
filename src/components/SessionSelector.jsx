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
      console.log('Loaded sessions from API:', data);
      console.log('Number of sessions:', data?.length || 0);
      
      // Ensure data is an array
      const sessionsList = Array.isArray(data) ? data : [];
      setSessions(sessionsList);
      
      if (sessionsList.length > 0) {
        const first = sessionsList[0];
        console.log('First session object:', first);
        // Handle multiple possible property names: id, sessionId, SessionId
        const sessionId = first.id || first.sessionId || first.SessionId;
        const examId = first.examId || first.ExamId;
        console.log('Extracted sessionId:', sessionId, 'examId:', examId);
        
        if (sessionId) {
          setSelectedSessionId(sessionId);
          onSessionChange?.(sessionId);
        }
        if (examId) onExamChange?.(examId);
      } else {
        console.warn('No sessions returned from API');
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
    console.log('SessionSelector handleChange - selected value:', sessionId);
    // Validate it's a GUID format (GUIDs are 36 chars with dashes, or 32 without)
    if (!sessionId || (sessionId.length < 32 && !sessionId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))) {
      console.error('Invalid sessionId format:', sessionId, 'Length:', sessionId?.length);
      return;
    }
    setSelectedSessionId(sessionId);
    onSessionChange?.(sessionId);
    // Handle multiple possible property names: id, sessionId, SessionId
    const selected = sessions.find(s => {
      const id = s.id || s.sessionId || s.SessionId;
      return id === sessionId;
    });
    if (selected) {
      const examId = selected.examId || selected.ExamId;
      if (examId) onExamChange?.(examId);
    } else {
      console.warn('Selected session not found in sessions list:', sessionId);
    }
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

  // Filter valid sessions for display
  const validSessions = sessions.filter((session) => {
    // Handle multiple possible property names: id, sessionId, SessionId
    const sessionId = session.id || session.sessionId || session.SessionId;
    return sessionId && (typeof sessionId === 'string' || typeof sessionId === 'object');
  });

  if (sessions.length === 0) {
    return (
      <div className="session-selector">
        <label>Select Exam Session (for upload)</label>
        <div className="empty-message">No sessions found. Please check if the API is running.</div>
        <button onClick={loadSessions} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (validSessions.length === 0 && sessions.length > 0) {
    return (
      <div className="session-selector">
        <label>Select Exam Session (for upload)</label>
        <div className="error-message">
          Found {sessions.length} session(s) but none have valid sessionId. Check console for details.
        </div>
        <button onClick={loadSessions} className="retry-btn">
          Retry
        </button>
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
        {validSessions.map((session) => {
            // Handle multiple possible property names: id, sessionId, SessionId
            const sessionId = session.id || session.sessionId || session.SessionId;
            // Convert to string if it's a GUID object
            const sessionIdStr = typeof sessionId === 'string' ? sessionId : (sessionId?.toString() || '');
            
            // Handle multiple possible property names for exam name
            const examName = session.examTitle || session.examName || session.ExamName || session.ExamTitle || '';
            const sessionName = session.sessionName || session.SessionName || '';
            const isActive = session.isActive || session.IsActive || false;
            // Handle scheduledDate or startTime
            const startTime = session.scheduledDate || session.startTime || session.StartTime;
            const endTime = session.endTime || session.EndTime;
            
            const status = isActive ? '✓' : '✗';
            let startDate = 'Invalid Date';
            let endDate = 'Invalid Date';
            
            try {
              if (startTime) {
                const start = new Date(startTime);
                if (!isNaN(start.getTime())) {
                  startDate = start.toLocaleDateString();
                }
              }
            } catch (e) {
              console.warn('Error parsing startTime:', startTime, e);
            }
            
            try {
              if (endTime) {
                const end = new Date(endTime);
                if (!isNaN(end.getTime())) {
                  endDate = end.toLocaleDateString();
                }
              }
            } catch (e) {
              console.warn('Error parsing endTime:', endTime, e);
            }
            
            return (
              <option key={sessionIdStr} value={sessionIdStr}>
                {status} {examName} - {sessionName} ({startDate} - {endDate})
              </option>
            );
          })}
      </select>
    </div>
  );
}

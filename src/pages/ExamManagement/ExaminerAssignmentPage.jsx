import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import examService from '@services/exam';
import './ExamManagement.css';

const ExaminerAssignmentPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [examiners, setExaminers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState('');
  const [examinerSearch, setExaminerSearch] = useState('');

  useEffect(() => {
    loadExam();
    loadSessions();
    // Load examiners - you may need to create an API endpoint for this
    // For now, we'll use a placeholder
  }, [examId]);

  const loadExam = async () => {
    try {
      const examData = await examService.getExamById(examId);
      setExam(examData);
    } catch (err) {
      setError(err.message || 'Failed to load exam');
    }
  };

  const loadSessions = async () => {
    try {
      // Assuming there's an endpoint to get sessions by exam
      // For now, using placeholder
      setSessions([]);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExaminer = async (sessionId, examinerId) => {
    try {
      setLoading(true);
      await examService.assignExaminer(sessionId, examinerId);
      await loadSessions();
      alert('Examiner assigned successfully');
    } catch (err) {
      alert(err.message || 'Failed to assign examiner');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (sessionId, examinerId) => {
    if (!window.confirm('Are you sure you want to remove this examiner assignment?')) {
      return;
    }

    try {
      setLoading(true);
      await examService.removeExaminerAssignment(sessionId, examinerId);
      await loadSessions();
    } catch (err) {
      alert(err.message || 'Failed to remove examiner assignment');
    } finally {
      setLoading(false);
    }
  };

  const filteredExaminers = examiners.filter((examiner) =>
    examiner.name?.toLowerCase().includes(examinerSearch.toLowerCase()) ||
    examiner.email?.toLowerCase().includes(examinerSearch.toLowerCase())
  );

  if (loading && !exam) {
    return (
      <div className="exam-management-page">
        <div className="exam-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-management-page">
      <div className="exam-header">
        <h1>Assign Examiners - {exam?.title || exam?.examName || 'Exam'}</h1>
        <button className="secondary-btn" onClick={() => navigate('/exams')}>
          ← Back to Exams
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="assignment-section">
        <h3>Select Exam Session</h3>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="form-select"
        >
          <option value="">Select a session...</option>
          {sessions.map((session) => (
            <option key={session.id || session.sessionId} value={session.id || session.sessionId}>
              {session.name || session.sessionName}
            </option>
          ))}
        </select>
      </div>

      {selectedSession && (
        <>
          <div className="assignment-section">
            <h3>Available Examiners</h3>
            <input
              type="text"
              placeholder="Search examiners by name or email..."
              value={examinerSearch}
              onChange={(e) => setExaminerSearch(e.target.value)}
              className="form-input"
            />

            <div className="examiner-list">
              {filteredExaminers.length === 0 ? (
                <p className="muted">No examiners found. You may need to create examiners first.</p>
              ) : (
                filteredExaminers.map((examiner) => (
                  <div key={examiner.id || examiner.userId} className="examiner-item">
                    <div>
                      <strong>{examiner.name || examiner.username}</strong>
                      <p className="muted">{examiner.email}</p>
                    </div>
                    <button
                      className="primary-btn"
                      onClick={() => handleAssignExaminer(selectedSession, examiner.id || examiner.userId)}
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
                      onClick={() => handleRemoveAssignment(selectedSession, assignment.examinerId)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {sessions.length === 0 && (
        <div className="exam-card">
          <p>No exam sessions found. Please create a session first.</p>
        </div>
      )}
    </div>
  );
};

export default ExaminerAssignmentPage;


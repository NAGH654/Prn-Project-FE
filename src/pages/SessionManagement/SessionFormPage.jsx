import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionService } from '@services/session';
import examService from '@services/exam';
import './SessionManagement.css';

const SessionFormPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const isEdit = !!sessionId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);

  const [formData, setFormData] = useState({
    examId: '',
    sessionName: '',
    scheduledDate: '',
    location: '',
    maxStudents: 50,
    isActive: true,
  });

  useEffect(() => {
    loadExams();
    if (isEdit) {
      loadSession();
    }
  }, [sessionId]);

  const loadExams = async () => {
    try {
      const data = await examService.getAllExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load exams:', err);
    }
  };

  const loadSession = async () => {
    try {
      setLoading(true);
      const session = await sessionService.getById(sessionId);
      setFormData({
        examId: session.examId || '',
        sessionName: session.sessionName || '',
        scheduledDate: session.scheduledDate
          ? new Date(session.scheduledDate).toISOString().slice(0, 16)
          : '',
        location: session.location || '',
        maxStudents: session.maxStudents || 50,
        isActive: session.isActive !== undefined ? session.isActive : true,
      });
    } catch (err) {
      setError(err.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.sessionName.trim()) {
      setError('Session name is required');
      return;
    }
    if (!formData.examId) {
      setError('Exam is required');
      return;
    }
    if (!formData.scheduledDate) {
      setError('Scheduled date is required');
      return;
    }
    if (formData.maxStudents < 1) {
      setError('Max students must be at least 1');
      return;
    }

    try {
      setLoading(true);
      const sessionData = {
        examId: formData.examId,
        sessionName: formData.sessionName,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        location: formData.location || null,
        maxStudents: parseInt(formData.maxStudents, 10),
        isActive: formData.isActive,
      };

      if (isEdit) {
        // Remove examId from update request as it's not in UpdateExamSessionRequest
        const { examId, ...updateData } = sessionData;
        await sessionService.update(sessionId, updateData);
      } else {
        await sessionService.create(sessionData);
      }

      navigate('/sessions');
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} session`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="session-management-page">
        <div className="session-card">
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-management-page">
      <div className="session-header">
        <h1>{isEdit ? 'Edit Session' : 'Create New Session'}</h1>
        <button className="secondary-btn" onClick={() => navigate('/sessions')}>
          Back to List
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="session-card">
        <form onSubmit={handleSubmit} className="session-form">
          <div className="form-group">
            <label htmlFor="examId">
              Exam <span className="required">*</span>
            </label>
            <select
              id="examId"
              value={formData.examId}
              onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
              required
              disabled={isEdit}
            >
              <option value="">Select an exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title || exam.examName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sessionName">
              Session Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="sessionName"
              value={formData.sessionName}
              onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
              placeholder="e.g., Morning Session, Afternoon Session"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="scheduledDate">
              Scheduled Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="scheduledDate"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Room 101, Building A"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxStudents">
              Max Students <span className="required">*</span>
            </label>
            <input
              type="number"
              id="maxStudents"
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate('/sessions')}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionFormPage;


import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { hasRole } from '@utils/jwt';
import gradingService from '@services/grading';
import './Grading.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Graded', label: 'Graded' },
];

const PAGE_SIZE = 20;

const ExamSubmissionsPage = () => {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const examState = location.state?.exam;
  const [submissions, setSubmissions] = useState([]);
  const [metadata, setMetadata] = useState({ totalCount: 0, pageNumber: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (token && !hasRole(token, ['examiner', 'moderator', 'admin'])) {
      setError('You do not have permission to access grading. Examiner role required.');
      setLoading(false);
      return;
    }
  }, [isAuthenticated, token, navigate]);

  const loadSubmissions = async ({ page = 1, statusFilter = status, assigned = assignedToMe } = {}) => {
    if (!examId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await gradingService.getExamSubmissions(examId, {
        status: statusFilter || undefined,
        assignedToMe: assigned,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });
      setSubmissions(response?.items || response?.Items || []);
      setMetadata({
        totalCount: response?.totalCount || response?.TotalCount || 0,
        pageNumber: response?.pageNumber || response?.PageNumber || page,
        totalPages: response?.totalPages || response?.TotalPages || 1,
      });
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const pagedInfo = useMemo(() => {
    const total = metadata.totalCount || 0;
    const start = total === 0 ? 0 : (metadata.pageNumber - 1) * PAGE_SIZE + 1;
    const end = Math.min(metadata.pageNumber * PAGE_SIZE, total);
    return { total, start, end };
  }, [metadata]);

  const handleRowClick = (submission) => {
    navigate(`/grading/submissions/${submission.submissionId}`, {
      state: {
        exam: examState,
        examId,
      },
    });
  };

  return (
    <div className="grading-page">
      <div className="grading-header">
        <div>
          <p className="back-link" onClick={() => navigate('/grading')}>
            ← Back to exams
          </p>
          <h2>{examState?.examName || 'Exam submissions'}</h2>
          {examState?.subjectName ? (
            <p className="muted">
              {examState.subjectName} • {examState.semesterName}
            </p>
          ) : null}
        </div>
        <div className="filters">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              loadSubmissions({ statusFilter: e.target.value });
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={assignedToMe}
              onChange={(e) => {
                setAssignedToMe(e.target.checked);
                loadSubmissions({ assigned: e.target.checked });
              }}
            />
            Assigned to me
          </label>
        </div>
      </div>

      {error ? (
        <div className="grading-card">
          <p className="error-text">{error}</p>
          <button type="button" className="primary-btn" onClick={() => loadSubmissions()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="grading-card">
          {loading ? (
            <p>Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p>No submissions found for the current filter.</p>
          ) : (
            <>
              <p className="muted">
                Showing {pagedInfo.start}-{pagedInfo.end} of {pagedInfo.total} submissions
              </p>
              <div className="submissions-table">
                <div className="submissions-header">
                  <span>Student</span>
                  <span>Status</span>
                  <span>Violations</span>
                  <span>My grade</span>
                  <span>Others</span>
                  <span>Uploaded at</span>
                </div>
                {submissions.map((submission) => (
                  <button
                    key={submission.submissionId}
                    type="button"
                    className="submission-row"
                    onClick={() => handleRowClick(submission)}
                  >
                    <span>
                      <strong>{submission.studentId}</strong>
                      {submission.studentName ? <small>{submission.studentName}</small> : null}
                    </span>
                    <span className={`status-pill status-${String(submission.status).toLowerCase()}`}>
                      {submission.status}
                    </span>
                    <span>{submission.hasViolations ? 'Yes' : 'No'}</span>
                    <span>{submission.isGradedByMe ? '✅' : '—'}</span>
                    <span>{submission.isGradedByOthers ? submission.gradingCount : '—'}</span>
                    <span>{new Date(submission.submissionTime).toLocaleString()}</span>
                  </button>
                ))}
              </div>
              <div className="pagination">
                <button
                  type="button"
                  disabled={metadata.pageNumber <= 1}
                  onClick={() => loadSubmissions({ page: metadata.pageNumber - 1 })}
                >
                  Prev
                </button>
                <span>
                  Page {metadata.pageNumber} / {metadata.totalPages}
                </span>
                <button
                  type="button"
                  disabled={metadata.pageNumber >= metadata.totalPages}
                  onClick={() => loadSubmissions({ page: metadata.pageNumber + 1 })}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamSubmissionsPage;


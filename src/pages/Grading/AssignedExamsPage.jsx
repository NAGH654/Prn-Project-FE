import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { hasRole } from '@utils/jwt';
import gradingService from '@services/grading';
import './Grading.css';

const AssignedExamsPage = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);

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

  const loadExams = async () => {
    setLoading(true);
    setError(null);
    try {
      // Only load if authenticated and has correct role
      if (!isAuthenticated) {
        setError('Please login to access grading');
        setLoading(false);
        return;
      }

      if (token && !hasRole(token, ['examiner', 'moderator', 'admin'])) {
        setError('You do not have permission to access grading. Examiner role required.');
        setLoading(false);
        return;
      }

      console.log('Loading exams with token:', token ? 'Token present' : 'No token');
      const data = await gradingService.getAssignedExams();
      setExams(data || []);
    } catch (err) {
      console.error('Error loading exams:', err);
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load if authentication check passed
    if (isAuthenticated && (!token || hasRole(token, ['examiner', 'moderator', 'admin']))) {
      loadExams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const totals = useMemo(() => {
    if (!exams || exams.length === 0) {
      return null;
    }
    return exams.reduce(
      (acc, exam) => ({
        total: acc.total + exam.totalSubmissions,
        pending: acc.pending + exam.pendingSubmissions,
        processing: acc.processing + exam.processingSubmissions,
        graded: acc.graded + exam.gradedSubmissions,
        mine: acc.mine + exam.myGradedSubmissions,
      }),
      { total: 0, pending: 0, processing: 0, graded: 0, mine: 0 }
    );
  }, [exams]);

  if (loading) {
    return (
      <div className="grading-page">
        <div className="grading-card">
          <p>Loading assigned exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grading-page">
        <div className="grading-card">
          <p className="error-text">{error}</p>
          <button type="button" className="primary-btn" onClick={loadExams}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="grading-page">
        <div className="grading-card">
          <h2>No assigned exams</h2>
          <p>You have not been assigned to any exams for grading yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grading-page">
      {totals ? (
        <section className="grading-summary">
          <div className="summary-item">
            <p>Total submissions</p>
            <strong>{totals.total}</strong>
          </div>
          <div className="summary-item">
            <p>Pending</p>
            <strong>{totals.pending}</strong>
          </div>
          <div className="summary-item">
            <p>Processing</p>
            <strong>{totals.processing}</strong>
          </div>
          <div className="summary-item">
            <p>Graded</p>
            <strong>{totals.graded}</strong>
          </div>
          <div className="summary-item">
            <p>My graded</p>
            <strong>{totals.mine}</strong>
          </div>
        </section>
      ) : null}

      <div className="grading-grid">
        {exams.map((exam) => (
          <article key={exam.examId} className="exam-card">
            <header>
              <h3>{exam.examName}</h3>
              <p>{exam.subjectName} • {exam.semesterName}</p>
            </header>
            <ul className="exam-stats">
              <li>
                <span>Total</span>
                <strong>{exam.totalSubmissions}</strong>
              </li>
              <li>
                <span>Pending</span>
                <strong>{exam.pendingSubmissions}</strong>
              </li>
              <li>
                <span>Processing</span>
                <strong>{exam.processingSubmissions}</strong>
              </li>
              <li>
                <span>Graded</span>
                <strong>{exam.gradedSubmissions}</strong>
              </li>
              <li>
                <span>I graded</span>
                <strong>{exam.myGradedSubmissions}</strong>
              </li>
            </ul>
            <button
              type="button"
              className="primary-btn"
              onClick={() =>
                navigate(`/grading/exams/${exam.examId}`, {
                  state: { exam },
                })
              }
            >
              View submissions
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AssignedExamsPage;


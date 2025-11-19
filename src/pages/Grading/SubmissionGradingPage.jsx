import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import gradingService from '@services/grading';
import './Grading.css';

const SubmissionGradingPage = () => {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const examState = location.state?.exam;

  const [details, setDetails] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rubricValues, setRubricValues] = useState({});
  const [commentsValues, setCommentsValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [zeroReason, setZeroReason] = useState('');
  const [selectedViolations, setSelectedViolations] = useState([]);

  const loadDetails = async () => {
    if (!submissionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await gradingService.getSubmissionDetails(submissionId);
      setDetails(data);
      const rubricMap = {};
      const commentMap = {};
      data?.rubrics?.forEach((rubric) => {
        rubricMap[rubric.rubricId] = rubric.points ?? '';
        commentMap[rubric.rubricId] = rubric.comments ?? '';
      });
      setRubricValues(rubricMap);
      setCommentsValues(commentMap);
      const statusData = await gradingService.getSubmissionStatus(submissionId);
      setStatus(statusData);
    } catch (err) {
      setError(err.message || 'Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  const totalScore = useMemo(() => {
    if (!details?.rubrics) return 0;
    return details.rubrics.reduce((acc, rubric) => acc + (Number(rubricValues[rubric.rubricId]) || 0), 0);
  }, [details, rubricValues]);

  const maxScore = useMemo(() => {
    if (!details?.rubrics) return 0;
    return details.rubrics.reduce((acc, rubric) => acc + rubric.maxPoints, 0);
  }, [details]);

  const handlePointChange = (rubricId, value) => {
    setRubricValues((prev) => ({
      ...prev,
      [rubricId]: value,
    }));
  };

  const handleCommentChange = (rubricId, value) => {
    setCommentsValues((prev) => ({
      ...prev,
      [rubricId]: value,
    }));
  };

  const handleSubmitGrades = async () => {
    if (!details?.submissionId) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        submissionId: details.submissionId,
        grades: details.rubrics.map((rubric) => ({
          rubricId: rubric.rubricId,
          points: Number(rubricValues[rubric.rubricId]) || 0,
          comments: commentsValues[rubric.rubricId] || '',
        })),
      };
      const result = await gradingService.submitGrades(payload);
      setMessage(result?.message || 'Grades submitted successfully');
      await loadDetails();
    } catch (err) {
      setMessage(err.message || 'Failed to submit grades');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkZero = async () => {
    if (!details?.submissionId || !zeroReason.trim()) {
      setMessage('Please provide a reason before marking zero.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await gradingService.markZero({
        submissionId: details.submissionId,
        reason: zeroReason,
        violationIds: selectedViolations,
      });
      setMessage('Submission marked as zero. Awaiting moderator review.');
      setZeroReason('');
      setSelectedViolations([]);
      await loadDetails();
    } catch (err) {
      setMessage(err.message || 'Failed to mark zero');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grading-page">
        <div className="grading-card">
          <p>Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="grading-page">
        <div className="grading-card">
          <p className="error-text">{error || 'Submission not found'}</p>
          <button type="button" className="primary-btn" onClick={loadDetails}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grading-page">
      <div className="grading-header">
        <div>
          <p className="back-link" onClick={() => navigate(-1)}>
            ← Back
          </p>
          <h2>
            Submission {details.studentId}
            {details.studentName ? <span className="muted"> • {details.studentName}</span> : null}
          </h2>
          <p className="muted">
            {details.examName} • {new Date(details.submissionTime).toLocaleString()}
          </p>
        </div>
        <div className="score-summary">
          <span>Total</span>
          <strong>
            {totalScore.toFixed(2)} / {maxScore.toFixed(2)}
          </strong>
          <span className={`status-pill status-${String(details.status).toLowerCase()}`}>
            {details.status}
          </span>
        </div>
      </div>

      {message ? <div className="info-banner">{message}</div> : null}

      <div className="grading-columns">
        <section className="grading-card">
          <header className="section-header">
            <h3>Rubrics</h3>
            <button
              type="button"
              className="primary-btn"
              onClick={handleSubmitGrades}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save grades'}
            </button>
          </header>

          <div className="rubric-list">
            {details.rubrics.map((rubric) => (
              <article key={rubric.rubricId} className="rubric-item">
                <div className="rubric-heading">
                  <div>
                    <h4>{rubric.criteria}</h4>
                    {rubric.description ? <p className="muted">{rubric.description}</p> : null}
                  </div>
                  <span>Max {rubric.maxPoints}</span>
                </div>
                <div className="rubric-inputs">
                  <label>
                    Points
                    <input
                      type="number"
                      min="0"
                      max={rubric.maxPoints}
                      step="0.5"
                      value={rubricValues[rubric.rubricId]}
                      onChange={(e) => handlePointChange(rubric.rubricId, e.target.value)}
                    />
                  </label>
                  <label>
                    Comments
                    <textarea
                      rows={2}
                      value={commentsValues[rubric.rubricId]}
                      onChange={(e) => handleCommentChange(rubric.rubricId, e.target.value)}
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grading-card side-panel">
          <h3>Submission details</h3>
          <p>
            <strong>File:</strong>{' '}
            <a href={details.fileDownloadUrl} target="_blank" rel="noreferrer">
              {details.fileName}
            </a>
          </p>
          <p>
            <strong>Status:</strong> {details.status}
          </p>
          <p>
            <strong>Violations:</strong> {details.violations?.length || 0}
          </p>

          {details.violations?.length ? (
            <div className="violations-list">
              {details.violations.map((violation) => (
                <label key={violation.violationId} className="violation-item">
                  <input
                    type="checkbox"
                    checked={selectedViolations.includes(violation.violationId)}
                    onChange={(e) => {
                      setSelectedViolations((prev) =>
                        e.target.checked
                          ? [...prev, violation.violationId]
                          : prev.filter((id) => id !== violation.violationId)
                      );
                    }}
                  />
                  <div>
                    <p>
                      {violation.violationType} ({violation.severity})
                    </p>
                    <small>{violation.description}</small>
                  </div>
                </label>
              ))}
            </div>
          ) : null}

          <h4>Mark as zero</h4>
          <textarea
            placeholder="Provide reason (required)"
            value={zeroReason}
            onChange={(e) => setZeroReason(e.target.value)}
            rows={3}
          />
          <button type="button" className="danger-btn" onClick={handleMarkZero} disabled={saving}>
            Mark zero due to violations
          </button>

          {status ? (
            <div className="status-panel">
              <h4>Grading status</h4>
              <p>Examiners graded: {status.examinerCount}</p>
              <p>
                Double grading:{' '}
                {status.requiresDoubleGrading
                  ? status.isDoubleGradingComplete
                    ? 'Complete'
                    : 'Pending'
                  : 'Not required'}
              </p>
              {status.averageScore != null ? (
                <p>Average score: {status.averageScore.toFixed(2)}</p>
              ) : null}
              {status.examinerSummaries?.length ? (
                <ul className="examiner-list">
                  {status.examinerSummaries.map((summary) => (
                    <li key={summary.examinerId}>
                      <strong>{summary.examinerName || summary.examinerId}</strong>
                      <span>
                        {summary.totalScore.toFixed(2)} pts • {summary.rubricsGraded} rubrics
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default SubmissionGradingPage;


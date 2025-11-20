import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { hasRole } from '@utils/jwt';
import gradingService from '@services/grading';
import './Grading.css';

const SubmissionGradingPage = () => {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const examState = location.state?.exam;

  const [details, setDetails] = useState(null);
  const [status, setStatus] = useState(null);
  const [allGrades, setAllGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rubricValues, setRubricValues] = useState({});
  const [commentsValues, setCommentsValues] = useState({});
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editingPoints, setEditingPoints] = useState({});
  const [editingComments, setEditingComments] = useState({});
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [zeroReason, setZeroReason] = useState('');
  const [selectedViolations, setSelectedViolations] = useState([]);

  const loadDetails = async () => {
    if (!submissionId) return;
    setLoading(true);
    setError(null);
    try {
      const [data, statusData, gradesData] = await Promise.all([
        gradingService.getSubmissionDetails(submissionId),
        gradingService.getSubmissionStatus(submissionId),
        gradingService.getSubmissionGrades(submissionId).catch(() => []),
      ]);
      
      setDetails(data);
      setStatus(statusData);
      setAllGrades(gradesData || []);
      
      const rubricMap = {};
      const commentMap = {};
      data?.rubrics?.forEach((rubric) => {
        rubricMap[rubric.rubricId] = rubric.points ?? '';
        commentMap[rubric.rubricId] = rubric.comments ?? '';
      });
      setRubricValues(rubricMap);
      setCommentsValues(commentMap);
    } catch (err) {
      setError(err.message || 'Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

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

    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId, isAuthenticated, token, navigate]);

  const totalScore = useMemo(() => {
    if (!details?.rubrics) return 0;
    return details.rubrics.reduce((acc, rubric) => acc + (Number(rubricValues[rubric.rubricId]) || 0), 0);
  }, [details, rubricValues]);

  const maxScore = useMemo(() => {
    if (!details?.rubrics) return 0;
    return details.rubrics.reduce((acc, rubric) => acc + rubric.maxPoints, 0);
  }, [details]);

  const getGradesForRubric = (rubricId) => {
    return allGrades.filter((g) => g.rubricId === rubricId);
  };

  const hasMyGradeForRubric = (rubricId) => {
    // Check if current user has already graded this rubric
    // If details.rubrics has points/comments, it means current user has graded
    const rubric = details?.rubrics?.find((r) => r.rubricId === rubricId);
    return rubric && (rubric.points != null || rubric.comments);
  };

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

  const handleStartEdit = (grade) => {
    setEditingGradeId(grade.gradeId);
    setEditingPoints({ [grade.gradeId]: grade.points });
    setEditingComments({ [grade.gradeId]: grade.comments || '' });
  };

  const handleCancelEdit = () => {
    setEditingGradeId(null);
    setEditingPoints({});
    setEditingComments({});
  };

  const handleUpdateGrade = async (gradeId) => {
    if (!gradeId) return;
    setUpdating(true);
    setMessage(null);
    try {
      const payload = {
        points: Number(editingPoints[gradeId]) || 0,
        comments: editingComments[gradeId] || '',
      };
      const result = await gradingService.updateGrade(gradeId, payload);
      setMessage(result?.message || 'Grade updated successfully');
      setEditingGradeId(null);
      setEditingPoints({});
      setEditingComments({});
      await loadDetails();
    } catch (err) {
      setMessage(err.message || 'Failed to update grade');
    } finally {
      setUpdating(false);
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

      {message ? (
        <div className={`info-banner ${message.includes('error') || message.includes('Error') || message.includes('Failed') ? 'error-banner' : 'success-banner'}`}>
          {message}
        </div>
      ) : null}

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
            {details.rubrics.map((rubric) => {
              const rubricGrades = getGradesForRubric(rubric.rubricId);
              const hasMyGrade = hasMyGradeForRubric(rubric.rubricId);
              const isEditing = editingGradeId && rubricGrades.some((g) => g.gradeId === editingGradeId);

              return (
                <article key={rubric.rubricId} className="rubric-item">
                  <div className="rubric-heading">
                    <div>
                      <h4>{rubric.criteria}</h4>
                      {rubric.description ? <p className="muted">{rubric.description}</p> : null}
                    </div>
                    <span>Max {rubric.maxPoints}</span>
                  </div>

                  {/* Show existing grades from other examiners */}
                  {rubricGrades.length > 0 && (
                    <div className="existing-grades">
                      <h5>Grades from examiners:</h5>
                      {rubricGrades.map((grade) => {
                        if (editingGradeId === grade.gradeId) {
                          return (
                            <div key={grade.gradeId} className="grade-edit-form">
                              <label>
                                Points
                                <input
                                  type="number"
                                  min="0"
                                  max={grade.maxPoints}
                                  step="0.5"
                                  value={editingPoints[grade.gradeId] || ''}
                                  onChange={(e) =>
                                    setEditingPoints({
                                      ...editingPoints,
                                      [grade.gradeId]: e.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label>
                                Comments
                                <textarea
                                  rows={2}
                                  value={editingComments[grade.gradeId] || ''}
                                  onChange={(e) =>
                                    setEditingComments({
                                      ...editingComments,
                                      [grade.gradeId]: e.target.value,
                                    })
                                  }
                                />
                              </label>
                              <div className="edit-actions">
                                <button
                                  type="button"
                                  className="primary-btn small-btn"
                                  onClick={() => handleUpdateGrade(grade.gradeId)}
                                  disabled={updating}
                                >
                                  {updating ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  type="button"
                                  className="secondary-btn small-btn"
                                  onClick={handleCancelEdit}
                                  disabled={updating}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={grade.gradeId} className="grade-item">
                            <div className="grade-header">
                              <span>
                                <strong>{grade.examinerName || grade.examinerId}</strong>
                                <small>{new Date(grade.gradedAt).toLocaleString()}</small>
                              </span>
                              <div className="grade-actions">
                                <span className="grade-points">
                                  {grade.points.toFixed(2)} / {grade.maxPoints}
                                </span>
                                {grade.isFinal && (
                                  <button
                                    type="button"
                                    className="edit-btn"
                                    onClick={() => handleStartEdit(grade)}
                                    disabled={updating}
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>
                            {grade.comments && (
                              <p className="grade-comments">{grade.comments}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Input for new grade or edit my grade */}
                  {(!hasMyGrade || !isEditing) && (
                    <div className="rubric-inputs">
                      <label>
                        {hasMyGrade ? 'Update your grade:' : 'Your grade:'}
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
                  )}
                </article>
              );
            })}
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
              <div className="status-info">
                <div className="status-row">
                  <span>Examiners graded:</span>
                  <strong>{status.examinerCount}</strong>
                </div>
                <div className="status-row">
                  <span>Double grading:</span>
                  <strong>
                    {status.requiresDoubleGrading
                      ? status.isDoubleGradingComplete
                        ? '✓ Complete'
                        : '⏳ Pending'
                      : 'Not required'}
                  </strong>
                </div>
                {status.averageScore != null ? (
                  <div className="status-row">
                    <span>Average score:</span>
                    <strong>{status.averageScore.toFixed(2)} / {status.maxPossibleScore?.toFixed(2) || maxScore.toFixed(2)}</strong>
                  </div>
                ) : null}
                {status.requiresModeratorReview && (
                  <div className="warning-banner">
                    ⚠ Requires moderator review
                  </div>
                )}
              </div>
              {status.examinerSummaries?.length > 0 && (
                <div className="examiner-summaries">
                  <h5>Examiner summaries:</h5>
                  <ul className="examiner-list">
                    {status.examinerSummaries.map((summary) => (
                      <li key={summary.examinerId}>
                        <div>
                          <strong>{summary.examinerName || summary.examinerId}</strong>
                          {summary.lastGradedAt && (
                            <small>{new Date(summary.lastGradedAt).toLocaleString()}</small>
                          )}
                        </div>
                        <span>
                          {summary.totalScore.toFixed(2)} pts • {summary.rubricsGraded} rubrics
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default SubmissionGradingPage;


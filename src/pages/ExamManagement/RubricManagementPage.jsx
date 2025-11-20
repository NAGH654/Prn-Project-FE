import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import examService from '@services/exam';
import './ExamManagement.css';

const RubricManagementPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRubric, setEditingRubric] = useState(null);

  const [formData, setFormData] = useState({
    criteria: '',
    description: '',
    maxPoints: '',
  });

  useEffect(() => {
    loadExam();
    loadRubrics();
  }, [examId]);

  const loadExam = async () => {
    try {
      const examData = await examService.getExamById(examId);
      setExam(examData);
    } catch (err) {
      setError(err.message || 'Failed to load exam');
    }
  };

  const loadRubrics = async () => {
    try {
      setLoading(true);
      // Get rubrics from exam data or use grading service
      const examData = await examService.getExamById(examId);
      setRubrics(examData.rubrics || examData.rubricItems || []);
    } catch (err) {
      setError(err.message || 'Failed to load rubrics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRubric = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.criteria.trim()) {
      setError('Criteria is required');
      return;
    }
    if (!formData.maxPoints || parseFloat(formData.maxPoints) <= 0) {
      setError('Max points must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      await examService.addRubricItem(examId, {
        criteria: formData.criteria,
        description: formData.description || null,
        maxPoints: parseFloat(formData.maxPoints),
      });
      
      setFormData({ criteria: '', description: '', maxPoints: '' });
      setShowAddForm(false);
      await loadRubrics();
      await loadExam(); // Reload to check total points
    } catch (err) {
      setError(err.message || 'Failed to add rubric item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRubric = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await examService.updateRubricItem(examId, editingRubric.id || editingRubric.rubricId, {
        criteria: formData.criteria,
        description: formData.description || null,
        maxPoints: parseFloat(formData.maxPoints),
      });
      
      setEditingRubric(null);
      setFormData({ criteria: '', description: '', maxPoints: '' });
      await loadRubrics();
      await loadExam();
    } catch (err) {
      setError(err.message || 'Failed to update rubric item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRubric = async (rubricId) => {
    if (!window.confirm('Are you sure you want to delete this rubric item?')) {
      return;
    }

    try {
      setLoading(true);
      await examService.deleteRubricItem(examId, rubricId);
      await loadRubrics();
      await loadExam();
    } catch (err) {
      setError(err.message || 'Failed to delete rubric item');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (rubric) => {
    setEditingRubric(rubric);
    setFormData({
      criteria: rubric.criteria || '',
      description: rubric.description || '',
      maxPoints: rubric.maxPoints || rubric.maxPoints || '',
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingRubric(null);
    setFormData({ criteria: '', description: '', maxPoints: '' });
    setShowAddForm(false);
  };

  const totalRubricPoints = rubrics.reduce((sum, r) => sum + (parseFloat(r.maxPoints) || 0), 0);
  const examTotalMarks = exam?.totalMarks || 0;
  const pointsMatch = Math.abs(totalRubricPoints - examTotalMarks) < 0.01;

  if (loading && !rubrics.length) {
    return (
      <div className="exam-management-page">
        <div className="exam-card">
          <p>Loading rubrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-management-page">
      <div className="exam-header">
        <h1>Manage Rubrics - {exam?.title || exam?.examName || 'Exam'}</h1>
        <button className="secondary-btn" onClick={() => navigate('/exams')}>
          ← Back to Exams
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="rubric-summary">
        <p>
          <strong>Total Rubric Points:</strong> {totalRubricPoints.toFixed(2)} / {examTotalMarks.toFixed(2)}
        </p>
        {!pointsMatch && (
          <p className="warning-text">
            ⚠️ Total rubric points must equal exam total marks ({examTotalMarks})
          </p>
        )}
      </div>

      {!showAddForm ? (
        <button className="primary-btn" onClick={() => setShowAddForm(true)}>
          + Add Rubric Item
        </button>
      ) : (
        <div className="exam-card">
          <h3>{editingRubric ? 'Edit Rubric Item' : 'Add Rubric Item'}</h3>
          <form onSubmit={editingRubric ? handleUpdateRubric : handleAddRubric}>
            <div className="form-group">
              <label>
                Criteria <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.criteria}
                onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                placeholder="e.g., Code Quality"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Evaluate code structure, comments, and best practices"
              />
            </div>

            <div className="form-group">
              <label>
                Max Points <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maxPoints}
                onChange={(e) => setFormData({ ...formData, maxPoints: e.target.value })}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={cancelEdit}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Saving...' : editingRubric ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rubric-list">
        {rubrics.length === 0 ? (
          <div className="exam-card">
            <p>No rubric items yet. Add your first rubric!</p>
          </div>
        ) : (
          rubrics.map((rubric) => (
            <div key={rubric.id || rubric.rubricId} className="rubric-item">
              <div className="rubric-item-header">
                <h4>{rubric.criteria}</h4>
                <span className="points-badge">Max {rubric.maxPoints} pts</span>
              </div>
              {rubric.description && <p className="muted">{rubric.description}</p>}
              <div className="rubric-item-actions">
                <button className="secondary-btn" onClick={() => startEdit(rubric)}>
                  Edit
                </button>
                <button
                  className="danger-btn"
                  onClick={() => handleDeleteRubric(rubric.id || rubric.rubricId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RubricManagementPage;


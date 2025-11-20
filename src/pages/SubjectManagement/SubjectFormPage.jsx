import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import subjectService from '@services/subject';
import './SubjectManagement.css';

const SubjectFormPage = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const isEdit = !!subjectId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: 0,
  });

  useEffect(() => {
    if (isEdit) {
      loadSubject();
    }
  }, [subjectId]);

  const loadSubject = async () => {
    try {
      setLoading(true);
      const subject = await subjectService.getById(subjectId);
      setFormData({
        code: subject.code || subject.subjectCode || '',
        name: subject.name || subject.subjectName || '',
        description: subject.description || '',
        credits: subject.credits || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load subject');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.code.trim()) {
      setError('Subject code is required');
      return;
    }
    if (!formData.name.trim()) {
      setError('Subject name is required');
      return;
    }
    if (formData.credits < 0) {
      setError('Credits must be a positive number');
      return;
    }

    try {
      setLoading(true);
      const subjectData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        credits: parseInt(formData.credits, 10) || 0,
      };

      if (isEdit) {
        await subjectService.updateSubject(subjectId, subjectData);
      } else {
        await subjectService.createSubject(subjectData);
      }

      navigate('/subjects');
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} subject`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="management-page">
        <div className="management-card">
          <p>Loading subject...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="management-header">
        <h1>{isEdit ? 'Edit Subject' : 'Create New Subject'}</h1>
        <button className="secondary-btn" onClick={() => navigate('/subjects')}>
          ← Back to Subjects
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="management-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Subject Code <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., PRN232"
            required
            maxLength={20}
          />
          <small>Unique code for the subject (e.g., PRN232, CS101)</small>
        </div>

        <div className="form-group">
          <label>
            Subject Name <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Programming Fundamentals"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Subject description..."
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label>Credits</label>
          <input
            type="number"
            min="0"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
            placeholder="e.g., 3"
          />
          <small>Number of credit hours for this subject</small>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/subjects')}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Subject' : 'Create Subject'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubjectFormPage;


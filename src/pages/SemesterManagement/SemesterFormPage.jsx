import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import semesterService from '@services/semester';
import './SemesterManagement.css';

const SemesterFormPage = () => {
  const navigate = useNavigate();
  const { semesterId } = useParams();
  const isEdit = !!semesterId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (isEdit) {
      loadSemester();
    }
  }, [semesterId]);

  const loadSemester = async () => {
    try {
      setLoading(true);
      const semester = await semesterService.getById(semesterId);
      setFormData({
        name: semester.name || semester.semesterName || '',
        startDate: semester.startDate ? new Date(semester.startDate).toISOString().split('T')[0] : '',
        endDate: semester.endDate ? new Date(semester.endDate).toISOString().split('T')[0] : '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load semester');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Semester name is required');
      return;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }
    if (!formData.endDate) {
      setError('End date is required');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const semesterData = {
        name: formData.name.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (isEdit) {
        await semesterService.updateSemester(semesterId, semesterData);
      } else {
        await semesterService.createSemester(semesterData);
      }

      navigate('/semesters');
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} semester`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="management-page">
        <div className="management-card">
          <p>Loading semester...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="management-header">
        <h1>{isEdit ? 'Edit Semester' : 'Create New Semester'}</h1>
        <button className="secondary-btn" onClick={() => navigate('/semesters')}>
          ← Back to Semesters
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="management-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Semester Name <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Fall 2024, Spring 2025"
            required
            maxLength={100}
          />
          <small>Name of the semester (e.g., Fall 2024, Spring 2025)</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Start Date <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>
              End Date <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              min={formData.startDate || undefined}
            />
            <small>Must be after start date</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/semesters')}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Semester' : 'Create Semester'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SemesterFormPage;


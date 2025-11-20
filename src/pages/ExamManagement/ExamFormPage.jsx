import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import examService from '@services/exam';
import { subjectService } from '@services/subject';
import { semesterService } from '@services/semester';
import './ExamManagement.css';

const ExamFormPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const isEdit = !!examId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    semesterId: '',
    examDate: '',
    durationMinutes: 120,
    totalMarks: 100,
  });

  useEffect(() => {
    loadSubjects();
    loadSemesters();
    if (isEdit) {
      loadExam();
    }
  }, [examId]);

  const loadSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const loadSemesters = async () => {
    try {
      const data = await semesterService.getAll();
      setSemesters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load semesters:', err);
    }
  };

  const loadExam = async () => {
    try {
      setLoading(true);
      const exam = await examService.getExamById(examId);
      setFormData({
        title: exam.title || exam.examName || '',
        description: exam.description || '',
        subjectId: exam.subjectId || '',
        semesterId: exam.semesterId || '',
        examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
        durationMinutes: exam.durationMinutes || 120,
        totalMarks: exam.totalMarks || 100,
      });
    } catch (err) {
      setError(err.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Exam title is required');
      return;
    }
    if (!formData.subjectId) {
      setError('Subject is required');
      return;
    }
    if (!formData.semesterId) {
      setError('Semester is required');
      return;
    }
    if (formData.durationMinutes < 30 || formData.durationMinutes > 300) {
      setError('Duration must be between 30 and 300 minutes');
      return;
    }

    try {
      setLoading(true);
      const examData = {
        title: formData.title,
        description: formData.description || null,
        subjectId: formData.subjectId,
        semesterId: formData.semesterId,
        examDate: new Date(formData.examDate).toISOString(),
        durationMinutes: parseInt(formData.durationMinutes, 10),
        totalMarks: parseFloat(formData.totalMarks),
      };

      if (isEdit) {
        await examService.updateExam(examId, examData);
      } else {
        await examService.createExam(examData);
      }

      navigate('/exams');
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} exam`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="exam-management-page">
        <div className="exam-card">
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-management-page">
      <div className="exam-header">
        <h1>{isEdit ? 'Edit Exam' : 'Create New Exam'}</h1>
        <button className="secondary-btn" onClick={() => navigate('/exams')}>
          ← Back to Exams
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="exam-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Exam Title <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., PRN232 Final Exam"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Exam description..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Subject <span className="required">*</span>
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id || subject.subjectId} value={subject.id || subject.subjectId}>
                  {subject.name || subject.subjectName} ({subject.code || subject.subjectCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Semester <span className="required">*</span>
            </label>
            <select
              value={formData.semesterId}
              onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester.id || semester.semesterId} value={semester.id || semester.semesterId}>
                  {semester.name || semester.semesterName} ({semester.code || semester.semesterCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Exam Date <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Duration (minutes) <span className="required">*</span>
            </label>
            <input
              type="number"
              min="30"
              max="300"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              required
            />
            <small>Must be between 30-300 minutes</small>
          </div>

          <div className="form-group">
            <label>
              Total Marks <span className="required">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/exams')}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Exam' : 'Create Exam'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamFormPage;


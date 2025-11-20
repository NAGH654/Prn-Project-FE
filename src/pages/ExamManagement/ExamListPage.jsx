import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import examService from '@services/exam';
import './ExamManagement.css';

const ExamListPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  useEffect(() => {
    loadExams();
  }, [filterSubject, filterSemester]);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      
      if (filterSubject) {
        data = await examService.getExamsBySubject(filterSubject);
      } else if (filterSemester) {
        data = await examService.getExamsBySemester(filterSemester);
      } else {
        data = await examService.getAllExams();
      }
      
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId, examName) => {
    if (!window.confirm(`Are you sure you want to delete "${examName}"?`)) {
      return;
    }

    try {
      await examService.deleteExam(examId);
      await loadExams();
    } catch (err) {
      alert(err.message || 'Failed to delete exam');
    }
  };

  const handlePublish = async (examId) => {
    try {
      await examService.publishExam(examId);
      await loadExams();
    } catch (err) {
      alert(err.message || 'Failed to publish exam');
    }
  };

  if (loading) {
    return (
      <div className="exam-management-page">
        <div className="exam-card">
          <p>Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-management-page">
      <div className="exam-header">
        <h1>Exam Management</h1>
        <button
          className="primary-btn"
          onClick={() => navigate('/exams/create')}
        >
          + Create New Exam
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={loadExams}>Retry</button>
        </div>
      )}

      <div className="exam-filters">
        <input
          type="text"
          placeholder="Filter by Subject ID..."
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Semester ID..."
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
        />
        <button onClick={() => { setFilterSubject(''); setFilterSemester(''); }}>
          Clear Filters
        </button>
      </div>

      <div className="exam-list">
        {exams.length === 0 ? (
          <div className="exam-card">
            <p>No exams found. Create your first exam!</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id || exam.examId} className="exam-card">
              <div className="exam-card-header">
                <h3>{exam.title || exam.examName}</h3>
                <span className={`status-pill status-${(exam.status || 'draft').toLowerCase()}`}>
                  {exam.status || 'Draft'}
                </span>
              </div>
              
              <div className="exam-card-body">
                <p className="muted">
                  {exam.subjectName || 'N/A'} • {exam.semesterName || 'N/A'}
                </p>
                <p className="muted">
                  Date: {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'} • 
                  Duration: {exam.durationMinutes || 0} minutes • 
                  Total Marks: {exam.totalMarks || 0}
                </p>
                {exam.description && <p>{exam.description}</p>}
              </div>

              <div className="exam-card-actions">
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/exams/${exam.id || exam.examId}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/exams/${exam.id || exam.examId}/rubrics`)}
                >
                  Manage Rubrics
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/exams/${exam.id || exam.examId}/examiners`)}
                >
                  Assign Examiners
                </button>
                {exam.status !== 'Published' && (
                  <button
                    className="primary-btn"
                    onClick={() => handlePublish(exam.id || exam.examId)}
                  >
                    Publish
                  </button>
                )}
                <button
                  className="danger-btn"
                  onClick={() => handleDelete(exam.id || exam.examId, exam.title || exam.examName)}
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

export default ExamListPage;


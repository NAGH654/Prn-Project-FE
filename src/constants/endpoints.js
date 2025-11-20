// API Endpoints
export const ENDPOINTS = {
  SESSIONS: '/sessions',
  SESSIONS_ACTIVE: '/sessions/active',
  SUBMISSIONS_UPLOAD: '/submissions/upload',
  SUBMISSIONS_UPLOAD_NESTED_ZIP: '/submissions/upload/nested-zip',
  SUBMISSIONS_IMAGES: (submissionId) => `/submissions/${submissionId}/images`,
  SESSION_STUDENTS: (sessionId) => `/submissions/session/${sessionId}/students`,
  SUBMISSION_TEXT: (submissionId) => `/submissions/${submissionId}/text`,
  REPORTS_SUBMISSIONS: '/reports/submissions',
  REPORTS_EXPORT: '/reports/submissions/export',
  REPORTS_ODATA: '/reports/submissions/odata',
  GRADING_ASSIGNED_EXAMS: '/api/grades/exams',
  GRADING_EXAM_SUBMISSIONS: (examId) => `/api/grades/exams/${examId}/submissions`,
  GRADING_SUBMISSION_DETAILS: (submissionId) => `/api/grades/submissions/${submissionId}/details`,
  GRADING_EXAM_RUBRICS: (examId) => `/api/grades/exams/${examId}/rubrics`,
  GRADING_SUBMIT: '/api/grades/submissions/grade',
  GRADING_UPDATE: (gradeId) => `/api/grades/grades/${gradeId}`,
  GRADING_MARK_ZERO: '/api/grades/submissions/mark-zero',
  GRADING_SUBMISSION_STATUS: (submissionId) => `/api/grades/submissions/${submissionId}/grading-status`,
  GRADING_SUBMISSION_GRADES: (submissionId) => `/api/grades/submissions/${submissionId}/grades`,
  // Exam Management
  EXAMS: '/exams',
  EXAMS_BY_ID: (examId) => `/exams/${examId}`,
  EXAMS_BY_SUBJECT: (subjectId) => `/exams/by-subject/${subjectId}`,
  EXAMS_BY_SEMESTER: (semesterId) => `/exams/by-semester/${semesterId}`,
  EXAMS_PUBLISH: (examId) => `/exams/${examId}/publish`,
  EXAMS_RUBRICS: (examId) => `/exams/${examId}/rubrics`,
  EXAMS_RUBRICS_BULK: (examId) => `/exams/${examId}/rubrics/bulk`,
  EXAMS_RUBRICS_BY_ID: (examId, rubricId) => `/exams/${examId}/rubrics/${rubricId}`,
  EXAMS_SESSIONS_EXAMINERS: (sessionId) => `/exams/sessions/${sessionId}/examiners`,
  EXAMS_SESSIONS_EXAMINERS_BY_ID: (sessionId, examinerId) => `/exams/sessions/${sessionId}/examiners/${examinerId}`,
  // Subjects & Semesters
  SUBJECTS: '/subjects',
  SUBJECTS_BY_ID: (subjectId) => `/subjects/${subjectId}`,
  SEMESTERS: '/semesters',
};

export default ENDPOINTS;


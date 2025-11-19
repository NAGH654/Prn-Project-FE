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
  GRADING_ASSIGNED_EXAMS: '/grades/exams',
  GRADING_EXAM_SUBMISSIONS: (examId) => `/grades/exams/${examId}/submissions`,
  GRADING_SUBMISSION_DETAILS: (submissionId) => `/grades/submissions/${submissionId}/details`,
  GRADING_EXAM_RUBRICS: (examId) => `/grades/exams/${examId}/rubrics`,
  GRADING_SUBMIT: '/grades/submissions/grade',
  GRADING_UPDATE: (gradeId) => `/grades/grades/${gradeId}`,
  GRADING_MARK_ZERO: '/grades/submissions/mark-zero',
  GRADING_SUBMISSION_STATUS: (submissionId) => `/grades/submissions/${submissionId}/grading-status`,
  GRADING_SUBMISSION_GRADES: (submissionId) => `/grades/submissions/${submissionId}/grades`,
};

export default ENDPOINTS;


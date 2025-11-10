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
};

export default ENDPOINTS;


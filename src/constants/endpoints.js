// API Endpoints
export const ENDPOINTS = {
  SESSIONS: '/sessions',
  SESSIONS_ACTIVE: '/sessions/active',
  SUBMISSIONS_UPLOAD: '/submissions/upload',
  SUBMISSIONS_UPLOAD_NESTED_ZIP: '/submissions/upload/nested-zip',
  SUBMISSIONS_IMAGES: (submissionId) => `/submissions/${submissionId}/images`,
};

export default ENDPOINTS;


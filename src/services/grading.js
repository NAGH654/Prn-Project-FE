import { CONFIG } from '@lib/config';
import ENDPOINTS from '@constants/endpoints';

const buildUrl = (path, params) => {
  const url = new URL(`${CONFIG.GRADING_API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
};

const jsonHeaders = { 'Content-Type': 'application/json' };

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `${response.status} ${response.statusText}` ||
      'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

export const gradingService = {
  async getAssignedExams(params) {
    const response = await fetch(buildUrl(ENDPOINTS.GRADING_ASSIGNED_EXAMS, params));
    return handleResponse(response);
  },

  async getExamSubmissions(examId, params) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_EXAM_SUBMISSIONS(examId), params)
    );
    return handleResponse(response);
  },

  async getSubmissionDetails(submissionId, params) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_SUBMISSION_DETAILS(submissionId), params)
    );
    return handleResponse(response);
  },

  async getExamRubrics(examId) {
    const response = await fetch(buildUrl(ENDPOINTS.GRADING_EXAM_RUBRICS(examId)));
    return handleResponse(response);
  },

  async submitGrades(payload) {
    const response = await fetch(
      `${CONFIG.GRADING_API_BASE_URL}${ENDPOINTS.GRADING_SUBMIT}`,
      {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
      }
    );
    return handleResponse(response);
  },

  async updateGrade(gradeId, payload) {
    const response = await fetch(
      `${CONFIG.GRADING_API_BASE_URL}${ENDPOINTS.GRADING_UPDATE(gradeId)}`,
      {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
      }
    );
    return handleResponse(response);
  },

  async markZero(payload) {
    const response = await fetch(
      `${CONFIG.GRADING_API_BASE_URL}${ENDPOINTS.GRADING_MARK_ZERO}`,
      {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
      }
    );
    return handleResponse(response);
  },

  async getSubmissionStatus(submissionId) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_SUBMISSION_STATUS(submissionId))
    );
    return handleResponse(response);
  },

  async getSubmissionGrades(submissionId) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_SUBMISSION_GRADES(submissionId))
    );
    return handleResponse(response);
  },
};

export default gradingService;


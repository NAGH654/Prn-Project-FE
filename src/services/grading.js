import { CONFIG } from '@lib/config';
import ENDPOINTS from '@constants/endpoints';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' 
    ? window.localStorage.getItem('access_token') 
    : null;
  
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Token found, adding Authorization header');
  } else {
    console.warn('No token found in localStorage');
  }
  return headers;
};

const buildUrl = (path, params) => {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Remove trailing / from base URL if present
  let baseUrl = CONFIG.GRADING_API_BASE_URL;
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  // If path already starts with /api, use API_HOST instead of GRADING_API_BASE_URL
  // to avoid double /api
  if (cleanPath.startsWith('/api/')) {
    baseUrl = CONFIG.API_HOST || 'http://localhost:5000';
  }
  
  let url = `${baseUrl}${cleanPath}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
};

const buildFetchOptions = (method = 'GET', body = null) => {
  const headers = getAuthHeaders();
  
  const options = {
    method,
    headers,
    // Don't use credentials: 'include' - Authorization header is sent via headers, not cookies
    // Using credentials: 'include' requires specific CORS origin (not wildcard *)
    // and can cause issues with reverse proxies
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

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
    const url = buildUrl(ENDPOINTS.GRADING_ASSIGNED_EXAMS, params);
    const options = buildFetchOptions('GET');
    console.log('Fetching assigned exams from:', url);
    console.log('Request headers:', options.headers);
    console.log('Has Authorization header:', !!options.headers['Authorization']);
    const response = await fetch(url, options);
    return handleResponse(response);
  },

  async getExamSubmissions(examId, params) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_EXAM_SUBMISSIONS(examId), params),
      buildFetchOptions('GET')
    );
    return handleResponse(response);
  },

  async getSubmissionDetails(submissionId, params) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_SUBMISSION_DETAILS(submissionId), params),
      buildFetchOptions('GET')
    );
    return handleResponse(response);
  },

  async getExamRubrics(examId) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_EXAM_RUBRICS(examId)),
      buildFetchOptions('GET')
    );
    return handleResponse(response);
  },

  async submitGrades(payload) {
    // Use API_HOST since endpoint already includes /api
    const baseUrl = CONFIG.API_HOST || 'http://localhost:5000';
    const url = `${baseUrl}${ENDPOINTS.GRADING_SUBMIT}`;
    const response = await fetch(url, buildFetchOptions('POST', payload));
    return handleResponse(response);
  },

  async updateGrade(gradeId, payload) {
    // Use API_HOST since endpoint already includes /api
    const baseUrl = CONFIG.API_HOST || 'http://localhost:5000';
    const url = `${baseUrl}${ENDPOINTS.GRADING_UPDATE(gradeId)}`;
    const response = await fetch(url, buildFetchOptions('PUT', payload));
    return handleResponse(response);
  },

  async markZero(payload) {
    // Use API_HOST since endpoint already includes /api
    const baseUrl = CONFIG.API_HOST || 'http://localhost:5000';
    const url = `${baseUrl}${ENDPOINTS.GRADING_MARK_ZERO}`;
    const response = await fetch(url, buildFetchOptions('POST', payload));
    return handleResponse(response);
  },

  async getSubmissionStatus(submissionId) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_SUBMISSION_STATUS(submissionId)),
      buildFetchOptions('GET')
    );
    return handleResponse(response);
  },

  async getSubmissionGrades(submissionId) {
    const response = await fetch(
      buildUrl(ENDPOINTS.GRADING_SUBMISSION_GRADES(submissionId)),
      buildFetchOptions('GET')
    );
    return handleResponse(response);
  },
};

export default gradingService;


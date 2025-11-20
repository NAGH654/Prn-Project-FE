import { API_BASE_URL } from '@lib/config';
import ENDPOINTS from '@constants/endpoints';

/**
 * API Service for communicating with backend
 */
export const apiService = {
  async getAllSessions() {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SESSIONS}`);
    if (!response.ok) throw new Error('Failed to fetch sessions');
    return response.json();
  },

  async getActiveSessions() {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SESSIONS_ACTIVE}`);
    if (!response.ok) throw new Error('Failed to fetch active sessions');
    return response.json();
  },

  async uploadSubmission(sessionId, file) {
    const formData = new FormData();
    formData.append('SessionId', sessionId);
    formData.append('Archive', file);

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SUBMISSIONS_UPLOAD}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  async uploadNestedZipSubmission(sessionId, file) {
    const formData = new FormData();
    formData.append('SessionId', sessionId);
    formData.append('Archive', file);

    console.log('Uploading nested ZIP submission, sessionId:', sessionId, 'file size:', file.size);

    // Create AbortController for timeout (30 minutes for large files)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30 * 60 * 1000);

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SUBMISSIONS_UPLOAD_NESTED_ZIP}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload response received:', {
        createdSubmissions: result.createdSubmissions?.length || result.CreatedSubmissions?.length || 0,
        totalFiles: result.totalFiles || result.TotalFiles,
        processedFiles: result.processedFiles || result.ProcessedFiles,
      });
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout. The file is too large or processing takes too long.');
      }
      throw error;
    }
  },

  async getSubmissionImages(submissionId) {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SUBMISSIONS_IMAGES(submissionId)}`);
    if (!response.ok) throw new Error('Failed to fetch images');
    return response.json();
  },

  async getSessionStudents(sessionId) {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SESSION_STUDENTS(sessionId)}`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  async getSubmissionText(submissionId) {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SUBMISSION_TEXT(submissionId)}`);
    if (!response.ok) throw new Error('Failed to fetch text');
    return response.json();
  },

  async getReports({ examId, from, to, page = 1, pageSize = 20 }) {
    const params = new URLSearchParams();
    if (examId) params.append('examId', examId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REPORTS_SUBMISSIONS}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },

  async exportReports({ examId, from, to }) {
    const params = new URLSearchParams();
    if (examId) params.append('examId', examId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REPORTS_EXPORT}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to export');
    const blob = await response.blob();
    return blob;
  },

  async queryOData(query) {
    // query should start with ?$filter=... etc
    const url = `${API_BASE_URL}${ENDPOINTS.REPORTS_ODATA}${query?.startsWith('?') ? query : `?${query || ''}`}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to query OData');
    return response.json();
  },
};

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

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SUBMISSIONS_UPLOAD_NESTED_ZIP}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  async getSubmissionImages(submissionId) {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.SUBMISSIONS_IMAGES(submissionId)}`);
    if (!response.ok) throw new Error('Failed to fetch images');
    return response.json();
  },
};

import { CORE_API_BASE_URL } from '@lib/config';

/**
 * Session Management Service
 * Handles all session-related API calls
 */
export const sessionService = {
  // Session CRUD
  async getAll() {
    const response = await fetch(`${CORE_API_BASE_URL}/sessions`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch sessions' }));
      throw new Error(error.message || 'Failed to fetch sessions');
    }
    return response.json();
  },

  async getActive() {
    const response = await fetch(`${CORE_API_BASE_URL}/sessions/active`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch active sessions' }));
      throw new Error(error.message || 'Failed to fetch active sessions');
    }
    return response.json();
  },

  async getById(sessionId) {
    const response = await fetch(`${CORE_API_BASE_URL}/sessions/${sessionId}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch session' }));
      throw new Error(error.message || 'Failed to fetch session');
    }
    return response.json();
  },

  async getByExamId(examId) {
    const response = await fetch(`${CORE_API_BASE_URL}/sessions/by-exam/${examId}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch sessions by exam' }));
      throw new Error(error.message || 'Failed to fetch sessions by exam');
    }
    return response.json();
  },

  async create(sessionData) {
    const response = await fetch(`${CORE_API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create session' }));
      throw new Error(error.message || 'Failed to create session');
    }
    return response.json();
  },

  async update(sessionId, sessionData) {
    const response = await fetch(`${CORE_API_BASE_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update session' }));
      throw new Error(error.message || 'Failed to update session');
    }
    return response.json();
  },

  async delete(sessionId) {
    const response = await fetch(`${CORE_API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete session' }));
      throw new Error(error.message || 'Failed to delete session');
    }
    return true;
  },

  // Examiner Assignment
  async assignExaminer(sessionId, examinerId, role = 'Examiner') {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/sessions/${sessionId}/examiners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examinerId, role }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to assign examiner' }));
      throw new Error(error.message || 'Failed to assign examiner');
    }
    return response.json();
  },

  async removeExaminer(sessionId, examinerId) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/sessions/${sessionId}/examiners/${examinerId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to remove examiner' }));
      throw new Error(error.message || 'Failed to remove examiner');
    }
    return true;
  },
};

export default sessionService;


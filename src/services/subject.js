import { CORE_API_BASE_URL } from '@lib/config';

/**
 * Subject Management Service
 * Handles all subject-related API calls
 */
export const subjectService = {
  async getAll() {
    const response = await fetch(`${CORE_API_BASE_URL}/subjects`);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return response.json();
  },

  async getById(subjectId) {
    const response = await fetch(`${CORE_API_BASE_URL}/subjects/${subjectId}`);
    if (!response.ok) throw new Error('Failed to fetch subject');
    return response.json();
  },

  async getByCode(code) {
    const response = await fetch(`${CORE_API_BASE_URL}/subjects/by-code/${code}`);
    if (!response.ok) throw new Error('Failed to fetch subject by code');
    return response.json();
  },

  async createSubject(subjectData) {
    const response = await fetch(`${CORE_API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create subject' }));
      throw new Error(error.message || 'Failed to create subject');
    }
    return response.json();
  },

  async updateSubject(subjectId, subjectData) {
    const response = await fetch(`${CORE_API_BASE_URL}/subjects/${subjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update subject' }));
      throw new Error(error.message || 'Failed to update subject');
    }
    return response.json();
  },

  async deleteSubject(subjectId) {
    const response = await fetch(`${CORE_API_BASE_URL}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete subject');
    return true;
  },
};

export default subjectService;


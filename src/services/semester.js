import { CORE_API_BASE_URL } from '@lib/config';

/**
 * Semester Management Service
 * Handles all semester-related API calls
 */
export const semesterService = {
  async getAll() {
    const response = await fetch(`${CORE_API_BASE_URL}/semesters`);
    if (!response.ok) throw new Error('Failed to fetch semesters');
    return response.json();
  },

  async getById(semesterId) {
    const response = await fetch(`${CORE_API_BASE_URL}/semesters/${semesterId}`);
    if (!response.ok) throw new Error('Failed to fetch semester');
    return response.json();
  },

  async createSemester(semesterData) {
    const response = await fetch(`${CORE_API_BASE_URL}/semesters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(semesterData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create semester' }));
      throw new Error(error.message || 'Failed to create semester');
    }
    return response.json();
  },

  async updateSemester(semesterId, semesterData) {
    const response = await fetch(`${CORE_API_BASE_URL}/semesters/${semesterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(semesterData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update semester' }));
      throw new Error(error.message || 'Failed to update semester');
    }
    return response.json();
  },

  async deleteSemester(semesterId) {
    const response = await fetch(`${CORE_API_BASE_URL}/semesters/${semesterId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete semester');
    return true;
  },
};

export default semesterService;


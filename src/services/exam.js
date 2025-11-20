import { CORE_API_BASE_URL } from '@lib/config';
import ENDPOINTS from '@constants/endpoints';

/**
 * Exam Management Service
 * Handles all exam-related API calls
 */
export const examService = {
  // Exam CRUD
  async getAllExams() {
    const response = await fetch(`${CORE_API_BASE_URL}/exams`);
    if (!response.ok) throw new Error('Failed to fetch exams');
    return response.json();
  },

  async getExamById(examId) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/${examId}`);
    if (!response.ok) throw new Error('Failed to fetch exam');
    return response.json();
  },

  async getExamsBySubject(subjectId) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/by-subject/${subjectId}`);
    if (!response.ok) throw new Error('Failed to fetch exams by subject');
    return response.json();
  },

  async getExamsBySemester(semesterId) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/by-semester/${semesterId}`);
    if (!response.ok) throw new Error('Failed to fetch exams by semester');
    return response.json();
  },

  async createExam(examData) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create exam' }));
      throw new Error(error.message || 'Failed to create exam');
    }
    return response.json();
  },

  async updateExam(examId, examData) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/${examId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update exam' }));
      throw new Error(error.message || 'Failed to update exam');
    }
    return response.json();
  },

  async deleteExam(examId) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/${examId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete exam');
    return true;
  },

  async publishExam(examId) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/${examId}/publish`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to publish exam' }));
      throw new Error(error.message || 'Failed to publish exam');
    }
    return response.json();
  },

  // Rubric Management
  async addRubricItem(examId, rubricData) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/${examId}/rubrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rubricData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add rubric item' }));
      throw new Error(error.message || 'Failed to add rubric item');
    }
    return response.json();
  },

  async addRubricItemsBulk(examId, rubricItems) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/${examId}/rubrics/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rubricItems),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add rubric items' }));
      throw new Error(error.message || 'Failed to add rubric items');
    }
    return response.json();
  },

  async updateRubricItem(examId, rubricItemId, rubricData) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/${examId}/rubrics/${rubricItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rubricData),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update rubric item' }));
      throw new Error(error.message || 'Failed to update rubric item');
    }
    return response.json();
  },

  async deleteRubricItem(examId, rubricItemId) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/${examId}/rubrics/${rubricItemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete rubric item');
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

  async removeExaminerAssignment(sessionId, examinerId) {
    const response = await fetch(`${CORE_API_BASE_URL}/exams/sessions/${sessionId}/examiners/${examinerId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove examiner assignment');
    return true;
  },
};

// Re-export subject and semester services for convenience
export { subjectService } from './subject';
export { semesterService } from './semester';

export default examService;


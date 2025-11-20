import { useCallback, useState } from 'react';
import { apiService } from '@services/api';

/**
 * Custom hook for managing submission state and operations
 */
export const useSubmission = () => {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState(null);
  const [createdSubmissions, setCreatedSubmissions] = useState([]);
  const [text, setText] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  const loadSessionStudents = useCallback(async (sessionId) => {
    if (!sessionId) {
      setCreatedSubmissions([]);
      return;
    }
    // Validate GUID format
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidPattern.test(sessionId)) {
      console.error('Invalid sessionId format in loadSessionStudents:', sessionId);
      setCreatedSubmissions([]);
      return;
    }
    try {
      console.log('Loading session students for sessionId:', sessionId);
      const students = await apiService.getSessionStudents(sessionId);
      setCreatedSubmissions(students || []);
    } catch (error) {
      console.error('Failed to load session students', error);
      setCreatedSubmissions([]);
      throw error;
    }
  }, []);

  const handleSessionChange = useCallback(async (sessionId) => {
    console.log('handleSessionChange called with sessionId:', sessionId, 'Type:', typeof sessionId);
    // Validate GUID format
    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!sessionId || !guidPattern.test(sessionId)) {
      console.error('Invalid sessionId in handleSessionChange:', sessionId);
      setSelectedSessionId(null);
      setCreatedSubmissions([]);
      return;
    }
    setSelectedSessionId(sessionId);
    setImages([]);
    setLastSubmissionId(null);
    setText('');
    try {
      await loadSessionStudents(sessionId);
    } catch {
      // already logged in loadSessionStudents
    }
  }, [loadSessionStudents]);

  const refreshSessionStudents = useCallback(async () => {
    if (!selectedSessionId) return;
    try {
      await loadSessionStudents(selectedSessionId);
    } catch {
      // handled
    }
  }, [selectedSessionId, loadSessionStudents]);

  const handleUpload = async (sessionId, file, isNestedZip = false) => {
    try {
      setUploading(true);
      const result = isNestedZip
        ? await apiService.uploadNestedZipSubmission(sessionId, file)
        : await apiService.uploadSubmission(sessionId, file);

      const list = result.createdSubmissions || result.CreatedSubmissions || [];
      setCreatedSubmissions(list);

      if (list.length > 0) {
        const first = list[0];
        const id = first.submissionId || first.SubmissionId;
        if (id) {
          setLastSubmissionId(id);
          // For single ZIP upload, auto show images immediately
          if (!isNestedZip) {
            await loadImagesForSubmission(id);
            await loadTextForSubmission(id);
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };
  // removed deprecated loadImagesForLatestSubmission

  const loadImagesForSubmission = async (submissionId) => {
    setLoadingImages(true);
    try {
      const imageList = await apiService.getSubmissionImages(submissionId);
      setImages(imageList);
      setLastSubmissionId(submissionId);
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([]);
      alert(`Failed to load images: ${error.message}`);
    } finally {
      setLoadingImages(false);
    }
  };

  const loadTextForSubmission = async (submissionId) => {
    setLoadingText(true);
    try {
      const res = await apiService.getSubmissionText(submissionId);
      setText(res?.text || res?.Text || '');
      setLastSubmissionId(submissionId);
    } catch (error) {
      console.error('Error loading text:', error);
      setText('');
    } finally {
      setLoadingText(false);
    }
  };

  return {
    selectedSessionId,
    uploading,
    images,
    loadingImages,
    text,
    loadingText,
    lastSubmissionId,
    createdSubmissions,
    handleSessionChange,
    handleUpload,
    loadImagesForSubmission,
    loadTextForSubmission,
    refreshSessionStudents,
  };
};


import { useState } from 'react';
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

  const handleSessionChange = async (sessionId) => {
    setSelectedSessionId(sessionId);
    setImages([]);
    setLastSubmissionId(null);
    try {
      if (sessionId) {
        const students = await apiService.getSessionStudents(sessionId);
        setCreatedSubmissions(students || []);
      } else {
        setCreatedSubmissions([]);
      }
      setText('');
    } catch (e) {
      console.error('Failed to load session students', e);
      setCreatedSubmissions([]);
    }
  };

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
  };
};


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

  const handleSessionChange = (sessionId) => {
    setSelectedSessionId(sessionId);
    setImages([]);
    setLastSubmissionId(null);
  };

  const handleUpload = async (sessionId, file, isNestedZip = false) => {
    try {
      setUploading(true);
      const result = isNestedZip
        ? await apiService.uploadNestedZipSubmission(sessionId, file)
        : await apiService.uploadSubmission(sessionId, file);

      if (result.submissionsCreated > 0) {
        // Auto-load images after a delay to allow backend processing
        setTimeout(() => {
          loadImagesForLatestSubmission(sessionId);
        }, 2000);
      }

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const loadImagesForLatestSubmission = async (sessionId) => {
    setLoadingImages(true);
    try {
      // Note: In a real scenario, you might want to query latest submission ID
      // For now, we'll show a message that images are being processed
      setImages([]);
      alert('Upload successful! Images are being processed. Please check back shortly or use Submission ID lookup.');
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

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

  return {
    selectedSessionId,
    uploading,
    images,
    loadingImages,
    lastSubmissionId,
    handleSessionChange,
    handleUpload,
    loadImagesForSubmission,
  };
};


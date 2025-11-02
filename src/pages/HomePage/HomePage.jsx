import { useState } from 'react';
import SessionSelector from '@components/SessionSelector';
import FileUpload from '@components/FileUpload';
import ImageGallery from '@components/ImageGallery';
import { useSubmission } from '@hooks/useSubmission';

/**
 * Home Page Component
 * Main page for uploading submissions and viewing images
 */
const HomePage = () => {
  const {
    selectedSessionId,
    uploading,
    images,
    loadingImages,
    lastSubmissionId,
    handleSessionChange,
    handleUpload,
    loadImagesForSubmission,
  } = useSubmission();

  const [submissionIdInput, setSubmissionIdInput] = useState('');

  const handleUploadNormal = async (sessionId, file) => {
    await handleUpload(sessionId, file, false);
  };

  const handleUploadNestedZip = async (sessionId, file) => {
    await handleUpload(sessionId, file, true);
  };

  const handleLoadImages = () => {
    const submissionId = submissionIdInput.trim();
    if (submissionId) {
      loadImagesForSubmission(submissionId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLoadImages();
    }
  };

  return (
    <>
      <div className="upload-section">
        <SessionSelector onSessionChange={handleSessionChange} />
        <FileUpload
          onUpload={handleUploadNormal}
          onUploadNestedZip={handleUploadNestedZip}
          isLoading={uploading}
          selectedSession={selectedSessionId}
        />
      </div>

      {lastSubmissionId && (
        <div className="submission-info">
          <p>Viewing images for Submission: {lastSubmissionId}</p>
          <button
            onClick={() => loadImagesForSubmission(lastSubmissionId)}
            className="refresh-btn"
          >
            Refresh Images
          </button>
        </div>
      )}

      <div className="manual-lookup">
        <h3>View Images by Submission ID</h3>
        <div className="lookup-input-group">
          <input
            type="text"
            placeholder="Enter Submission ID (GUID)"
            value={submissionIdInput}
            onChange={(e) => setSubmissionIdInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="lookup-input"
          />
          <button onClick={handleLoadImages} className="lookup-btn">
            Load Images
          </button>
        </div>
      </div>

      <ImageGallery images={images} isLoading={loadingImages} />
    </>
  );
};

export default HomePage;


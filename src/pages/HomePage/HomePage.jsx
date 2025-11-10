import { useMemo, useState } from 'react';
import SessionSelector from '@components/SessionSelector';
import FileUpload from '@components/FileUpload';
import ImageGallery from '@components/ImageGallery';
import TextViewer from '@components/TextViewer';
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
    text,
    loadingText,
    lastSubmissionId,
    createdSubmissions,
    handleSessionChange,
    handleUpload,
    loadImagesForSubmission,
    loadTextForSubmission,
  } = useSubmission();


  const handleUploadNormal = async (sessionId, file) => {
    await handleUpload(sessionId, file, false);
  };

  const handleUploadNestedZip = async (sessionId, file) => {
    await handleUpload(sessionId, file, true);
  };

  // Enhance UX: search/filter students when list is long
  const [studentQuery, setStudentQuery] = useState('');
  const filteredStudents = useMemo(() => {
    if (!createdSubmissions || createdSubmissions.length === 0) return [];
    const q = studentQuery.trim().toLowerCase();
    const list = createdSubmissions.map((s) => ({
      id: s.submissionId || s.SubmissionId,
      code: (s.studentId || s.StudentId || '').toString(),
      name: s.studentName || s.StudentName || '',
      file: s.fileName || s.FileName || '',
    }));
    if (!q) return list;
    return list.filter((x) =>
      x.code.toLowerCase().includes(q) ||
      x.name.toLowerCase().includes(q) ||
      x.file.toLowerCase().includes(q)
    );
  }, [createdSubmissions, studentQuery]);

  const [activeTab, setActiveTab] = useState('images');
  const selectedStudent = createdSubmissions?.find(
    (s) => (s.submissionId || s.SubmissionId) === lastSubmissionId
  );

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
          <p>
            Viewing: <strong>{selectedStudent?.StudentId || selectedStudent?.studentId || 'UNKNOWN'}</strong>
            {selectedStudent?.StudentName || selectedStudent?.studentName ? (
              <span> — {selectedStudent?.StudentName || selectedStudent?.studentName}</span>
            ) : null}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { if (lastSubmissionId) { navigator.clipboard?.writeText(lastSubmissionId); } }}
              className="refresh-btn"
              title="Copy Submission ID"
            >
              Copy ID
            </button>
            <button
              onClick={() => { if (lastSubmissionId) { loadImagesForSubmission(lastSubmissionId); loadTextForSubmission(lastSubmissionId); } }}
              className="refresh-btn"
              title="Refresh"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* If nested ZIP created many submissions, show a selectable list */}
      {createdSubmissions && createdSubmissions.length > 1 && (
        <div className="manual-lookup student-selector">
          <div className="student-selector-header">
            <h3>Select a student to view images</h3>
            <span className="student-count">{filteredStudents.length} / {createdSubmissions.length}</span>
          </div>
          <input
            type="text"
            className="student-search"
            placeholder="Search by ID or name..."
            value={studentQuery}
            onChange={(e) => setStudentQuery(e.target.value)}
          />
          <div className="student-list">
            {filteredStudents.map((s) => (
              <button
                key={s.id}
                className="student-chip"
                onClick={() => { loadImagesForSubmission(s.id); loadTextForSubmission(s.id); }}
                title={s.file}
              >
                <span className="student-code">{s.code || 'UNKNOWN'}</span>
                {s.name ? <span className="student-name"> – {s.name}</span> : null}
              </button>
            ))}
            {filteredStudents.length === 0 && (
              <div className="empty-state" style={{ width: '100%', textAlign: 'center', padding: '10px 0' }}>
                No result
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual lookup by Submission ID removed */}

      <div className="tabbed-view">
        <div className="tabs">
          <button className={`tab ${activeTab === 'images' ? 'active' : ''}`} onClick={() => setActiveTab('images')}>Images</button>
          <button className={`tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>Text</button>
        </div>
        {activeTab === 'images' ? (
          <ImageGallery images={images} isLoading={loadingImages} />
        ) : (
          <TextViewer text={text} isLoading={loadingText} />
        )}
      </div>
    </>
  );
};

export default HomePage;


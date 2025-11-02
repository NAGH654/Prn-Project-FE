import { useState, useRef } from 'react';
import './FileUpload.css';

export default function FileUpload({ onUpload, onUploadNestedZip, isLoading, selectedSession }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('normal'); // 'normal' or 'nested'
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
        setSelectedFile(file);
      } else {
        alert('Please select a ZIP or RAR file');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
        setSelectedFile(file);
      } else {
        alert('Please select a ZIP or RAR file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedSession) {
      alert('Please select a session first');
      return;
    }

    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      if (uploadMode === 'nested' && onUploadNestedZip) {
        await onUploadNestedZip(selectedSession, selectedFile);
      } else {
        await onUpload(selectedSession, selectedFile);
      }
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Submissions</h2>
      
      <div className="upload-mode-selector">
        <label>
          <input
            type="radio"
            name="uploadMode"
            value="normal"
            checked={uploadMode === 'normal'}
            onChange={(e) => setUploadMode(e.target.value)}
            disabled={isLoading}
          />
          <span>Normal Upload</span>
        </label>
        <label>
          <input
            type="radio"
            name="uploadMode"
            value="nested"
            checked={uploadMode === 'nested'}
            onChange={(e) => setUploadMode(e.target.value)}
            disabled={isLoading}
          />
          <span>Nested ZIP (Auto extract solution.zip)</span>
        </label>
      </div>
      
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${!selectedSession ? 'disabled' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.rar"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={isLoading || !selectedSession}
        />
        
        {selectedFile ? (
          <div className="file-info">
            <div className="file-icon">📦</div>
            <div className="file-details">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              className="clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={isLoading}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="drop-zone-content">
            <div className="upload-icon">📤</div>
            <p className="drop-text">
              {!selectedSession
                ? 'Please select a session first'
                : 'Drag and drop your ZIP/RAR file here'}
            </p>
            <p className="drop-hint">or click to browse</p>
          </div>
        )}
      </div>

      {selectedFile && selectedSession && (
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  );
}

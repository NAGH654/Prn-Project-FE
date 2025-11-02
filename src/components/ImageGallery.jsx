import { useState } from 'react';
import './ImageGallery.css';

export default function ImageGallery({ images, isLoading }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (isLoading) {
    return (
      <div className="gallery-container">
        <h2>Images</h2>
        <div className="loading">Loading images...</div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="gallery-container">
        <h2>Images</h2>
        <div className="empty-state">
          <p>No images found. Upload a submission to see extracted images.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2>Extracted Images ({images.length})</h2>
      <div className="image-grid">
        {images.map((image) => (
          <div
            key={image.imageId}
            className="image-item"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url}
              alt={image.imageName}
              loading="lazy"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EFailed to load%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="image-overlay">
              <p className="image-name">{image.imageName}</p>
              <p className="image-size">{formatSize(image.imageSize)}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedImage(null)}>
              ✕
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.imageName}
              className="modal-image"
            />
            <div className="modal-info">
              <p><strong>Name:</strong> {selectedImage.imageName}</p>
              <p><strong>Size:</strong> {formatSize(selectedImage.imageSize)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

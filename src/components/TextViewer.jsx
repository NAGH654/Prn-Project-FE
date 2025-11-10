import './ImageGallery.css';

export default function TextViewer({ text, isLoading }) {
  if (isLoading) {
    return (
      <div className="gallery-container">
        <h2>Text</h2>
        <div className="loading">Loading text...</div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2>Text</h2>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #eee',
        whiteSpace: 'pre-wrap',
        maxHeight: '400px',
        overflow: 'auto',
        lineHeight: 1.5,
        color: '#333'
      }}>
        {text ? text : 'No text extracted.'}
      </div>
    </div>
  );
}



import React, { useRef, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { MAX_UPLOAD_MB } from '../config/api';

const UploadGlyph = ({ className = '' }) => (
  <svg
    className={className}
    width="56"
    height="56"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19V5" />
    <path d="M7 10l5-5 5 5" />
    <path d="M4 19h16" />
  </svg>
);

const ShieldGlyph = ({ className = '' }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l7 3v5c0 4.9-3 9.5-7 11-4-1.5-7-6.1-7-11V6z" />
    <path d="M9.5 11.5L12 14l4-4" />
  </svg>
);

const StackGlyph = ({ className = '' }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3.5" y="7" width="17" height="10" rx="2.5" />
    <path d="M7 17v2h10v-2" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
  </svg>
);

const formatFileSize = (bytes = 0) => {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    return `${mb.toFixed(2)} MB`;
  }
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
};

const HighlightUploadPanel = ({ isProcessing, error, statusMessage, onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (!files?.length) return;
    const file = files[0];
    setSelectedFile({
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      overLimit: file.size > MAX_UPLOAD_MB * 1024 * 1024,
    });
    onFileSelected?.(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <Card className={`upload-panel ${isDragging ? 'dragging' : ''} ${isProcessing ? 'busy' : ''}`}>
      <Card.Body
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-busy={isProcessing}
      >
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="video/*"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <div className="upload-icon">
          <UploadGlyph className="icon-lg" />
        </div>

        <Card.Title>Drop your footage</Card.Title>
        <Card.Text className="text-muted-luxe">
          MP4 or MOV clips ({MAX_UPLOAD_MB}MB max)
        </Card.Text>

        <Button
          variant="outline-light"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            handleClick();
          }}
          disabled={isProcessing}
        >
          Browse files
        </Button>

        <div className="upload-meta">
          <span>
            <ShieldGlyph className="icon-inline" />
            Secure session
          </span>
          <span>
            <StackGlyph className="icon-inline" />
            AI scoring + FFmpeg stitching
          </span>
        </div>

        {selectedFile && (
          <div
            className={`file-preview-pill ${
              selectedFile.overLimit ? 'file-preview-pill--error' : ''
            }`}
          >
            <div>
              <p className="mb-0 text-light fw-semibold">{selectedFile.name}</p>
              <small className="text-muted-luxe">
                {selectedFile.sizeLabel}{' '}
                {selectedFile.overLimit && `• exceeds ${MAX_UPLOAD_MB}MB limit`}
              </small>
            </div>
            <span className="file-size-tag">
              {selectedFile.overLimit ? 'Too large' : 'Looks good'}
            </span>
          </div>
        )}

        {isProcessing && (
          <p className="status-text">Processing… keep this tab open.</p>
        )}

        {error && (
          <p className="status-text error">{error}</p>
        )}

        {statusMessage && !error && (
          <p className="status-text success">{statusMessage}</p>
        )}

        {isProcessing && (
          <div className="upload-overlay" aria-hidden="true">
            <div className="loader-gold" />
            <p className="text-light fw-semibold mt-2 mb-0">Analyzing…</p>
            <small className="text-muted-luxe">Detecting scenes & motion cues</small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default HighlightUploadPanel;

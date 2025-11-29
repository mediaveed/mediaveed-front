import React, { useCallback, useEffect, useState } from 'react';
import HighlightDashboard from '../features/highlight/pages/HighlightDashboard';
import '../features/highlight/styles/highlight.css';
import './highlightGenerator.css';
import HighlightGuide from '../features/highlight/components/HighlightGuide';

const HighlightGenerator = () => {
  const readStoredDownload = () => {
    try {
      const raw = localStorage.getItem('mediaveed_last_download');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Failed reading stored download:", error);
      return null;
    }
  };

  const [lastDownload, setLastDownload] = useState(readStoredDownload);

  const clearLastDownload = useCallback(() => {
    localStorage.removeItem('mediaveed_last_download');
  }, []);

  const handleBackToDownloader = useCallback(() => {
    window.dispatchEvent(new CustomEvent('mediaveed:navigate', { detail: 'home' }));
  }, []);

  useEffect(() => {
    const handleDownloadComplete = () => {
      setLastDownload(readStoredDownload());
    };

    window.addEventListener('mediaveed:downloadComplete', handleDownloadComplete);

    return () => {
      window.removeEventListener('mediaveed:downloadComplete', handleDownloadComplete);
    };
  }, []);

  return (
    <section className="highlight-embed">
      <div className="highlight-embed__header">
        <div className="highlight-embed__hero">
          <p className="eyebrow text-center">Tools / Automation</p>
          <h1>Highlight Generator <span className="badge-soft">Beta</span></h1>
          <p className="subtitle">
            AI-powered highlight detection for podcasters, streamers, and social teams. Upload full-length
            videos and let MediaVeed surface the highest-energy moments — then curate reels without leaving
            the dashboard.
          </p>
          <div className="highlight-embed__cta">
            <button type="button" className="cta-button secondary" onClick={handleBackToDownloader}>
              ← Back to Downloader
            </button>
            <button
              type="button"
              className="cta-button secondary"
              onClick={() => window.open('mailto:support@mediaveed.com?subject=Highlight%20Beta')}
            >
              Share feedback
            </button>
          </div>
          <small className="beta-disclaimer">Max duration 10 mins • MP4/MOV uploads • Requires Mediaveed login</small>
        </div>
      </div>

      <div className="highlight-engine-wrapper">
        <div className="highlight-engine">
          <HighlightDashboard
            autoVideoDownloadUrl={lastDownload?.downloadUrl}
            autoVideoTitle={lastDownload?.title}
            autoVideoCompletedAt={lastDownload?.completedAt}
            onAutoProcessingComplete={clearLastDownload}
            showBackButton
            onBack={handleBackToDownloader}
          />
        </div>
      </div>

      <HighlightGuide feedbackUrl={import.meta.env.VITE_HIGHLIGHT_FEEDBACK_URL} />
    </section>
  );
};

export default HighlightGenerator;

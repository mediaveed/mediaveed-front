import { useState, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import { API_BASE_URL, API_PREFIX, API_KEY, MAX_UPLOAD_MB } from '../config/api';

export const buildApiUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

export const getAuthHeaders = () => {
  const stored =
    localStorage.getItem('mediaveed_jwt') ||
    sessionStorage.getItem('mediaveed_jwt') ||
    '';
  return stored ? { Authorization: `Bearer ${stored}` } : {};
};

const captureHighlightError = (error, context) => {
  if (!error) return;
  if (Sentry && typeof Sentry.captureException === 'function') {
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'highlight-engine', context },
    });
  }
};

const useHighlightEngine = () => {
  // Analysis state
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [sessionId, setSessionId] = useState(null);

  // Reel state
  const [reel, setReel] = useState(null);
  const [reelLoading, setReelLoading] = useState(false);
  const [reelError, setReelError] = useState(null);

  // User selections
  const [style, setStyle] = useState('variety');
  const [selectedSegments, setSelectedSegments] = useState([]);

  /**
   * Upload and analyze a video file
   */
  const handleUpload = useCallback(async (file) => {
    if (!file) {
      setError('Please select a video file.');
      return;
    }

    if (!file.type.startsWith('video/')) {
      setError('Unsupported file type. Please upload an MP4 or MOV video file.');
      return;
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`File exceeds ${MAX_UPLOAD_MB}MB limit. Please upload a smaller clip.`);
      return;
    }

    // Reset state
    setProcessing(true);
    setError(null);
    setResult(null);
    setStatus('Uploading file…');
    setSessionId(null);
    setReel(null);
    setReelError(null);
    setSelectedSegments([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
          ...getAuthHeaders(),
        },
      });

      setStatus('Analyzing video…');

      if (!response.ok) {
        let errorMessage = 'Failed to analyze video';
        try {
          const detail = await response.json();
          errorMessage = detail?.detail?.error || detail?.detail || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const payload = await response.json();

      setResult(payload);
      setSessionId(payload.session_id || null);

      // Auto-select all segments initially
      if (payload.segments && Array.isArray(payload.segments)) {
        setSelectedSegments(payload.segments.map((seg) => seg.segment_id));
      }

      setStatus('Highlights ready — preview below');
    } catch (err) {
      console.error('Upload error:', err);
      captureHighlightError(err, 'analyze_upload');
      setError(err.message || 'An unexpected error occurred');
      setStatus('');
      setSelectedSegments([]);
    } finally {
      setProcessing(false);
    }
  }, []);

  /**
   * Toggle segment selection
   */
  const toggleSegment = useCallback((segmentId) => {
    setSelectedSegments((prev) => {
      if (prev.includes(segmentId)) {
        return prev.filter((id) => id !== segmentId);
      }
      return [...prev, segmentId];
    });
  }, []);

  /**
   * Create a highlight reel from selected segments
   */
  const createReel = useCallback(async () => {
    if (!sessionId) {
      setReelError('No session ID available');
      return;
    }

    if (selectedSegments.length === 0) {
      setReelError('Please select at least one segment');
      return;
    }

    if (reelLoading) return;

    setReelLoading(true);
    setReelError(null);
    setReel(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_PREFIX}/reel/${sessionId}?target_duration=60&max_segments=8&style=${style}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ selected_ids: selectedSegments }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to create highlight reel';
        try {
          const detail = await response.json();
          errorMessage = detail?.detail?.error || detail?.detail || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const payload = await response.json();
      setReel(payload);
    } catch (err) {
      console.error('Reel creation error:', err);
      captureHighlightError(err, 'create_reel');
      setReelError(err.message || 'An unexpected error occurred');
    } finally {
      setReelLoading(false);
    }
  }, [sessionId, reelLoading, selectedSegments, style]);

  /**
   * Download a file from a URL
   */
  const handleDownload = useCallback(async (url, filename) => {
    if (!url) {
      console.error('No URL provided for download');
      return;
    }

    try {
      const fullUrl = buildApiUrl(url);
      const response = await fetch(fullUrl, {
        headers: {
          ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Download error:', err);
      captureHighlightError(err, 'download_asset');
      setReelError(`Download failed: ${err.message}`);
    }
  }, []);

  // Normalize segments with full URLs
  const normalizedSegments = (result?.segments || []).map((segment) => ({
    ...segment,
    clip_url: buildApiUrl(segment.clip_url),
  }));

  // Normalize reel with full URLs
  const normalizedReel = reel
    ? {
        ...reel,
        download_url: buildApiUrl(reel.download_url),
        captions_url: buildApiUrl(reel.captions_url),
        timeline_url: buildApiUrl(reel.timeline_url),
      }
    : null;

  // Computed values
  const canCreateReel = Boolean(sessionId && selectedSegments.length > 0);
  const selectedCount = selectedSegments.length;
  const totalSegments = result?.segments?.length || 0;

  return {
    // Analysis state
    result,
    normalizedSegments,
    error,
    processing,
    status,
    setStatus,
    sessionId,

    // Reel state
    reel: normalizedReel,
    reelLoading,
    reelError,

    // User preferences
    style,
    setStyle,
    selectedSegments,
    selectedCount,
    totalSegments,
    canCreateReel,

    // Actions
    handleUpload,
    toggleSegment,
    createReel,
    handleDownload,

    // Utilities
    buildApiUrl,
  };
};

export default useHighlightEngine;

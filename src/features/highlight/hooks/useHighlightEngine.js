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

const deriveFriendlyMessage = (message, status) => {
  const normalized = (message || '').toLowerCase();
  if (status === 413 || normalized.includes('too large')) {
    return `That file exceeds the ${MAX_UPLOAD_MB}MB limit. Trim your clip and try again.`;
  }
  if (status === 422 || normalized.includes('too long')) {
    return 'This clip is longer than our current limit. Please trim the video and retry.';
  }
  if (status === 404 || normalized.includes('not found')) {
    return 'We could not find that highlight session. Please re-upload your video.';
  }
  if (status === 500 || normalized.includes('analysis failed') || normalized.includes('failed to create highlight')) {
    return 'We hit a processing snag. Please retry with a different clip or try again in a few minutes.';
  }
  if (normalized.includes('invalid api key')) {
    return 'Your session expired. Refresh and sign back in to continue.';
  }
  return message || 'Something went wrong. Please try again.';
};

const parseErrorResponse = async (response, fallback) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // ignore parse issues
  }
  const detail = payload?.detail ?? payload;
  let baseMessage =
    typeof detail === 'string' ? detail : detail?.error || detail?.message || fallback;
  if (detail?.tip) {
    baseMessage = `${baseMessage}${baseMessage ? ' — ' : ''}${detail.tip}`;
  }
  return deriveFriendlyMessage(baseMessage, response.status);
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
        const errorMessage = await parseErrorResponse(response, 'Failed to analyze video');
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
      const fallback = err?.message?.includes('Failed to fetch')
        ? 'Unable to reach the highlight engine. Check your connection and try again.'
        : err?.message;
      setError(fallback || 'An unexpected error occurred');
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
        const errorMessage = await parseErrorResponse(response, 'Failed to create highlight reel');
        throw new Error(errorMessage);
      }

      const payload = await response.json();
      setReel(payload);
    } catch (err) {
      console.error('Reel creation error:', err);
      captureHighlightError(err, 'create_reel');
      const friendly = err?.message?.includes('Failed to fetch')
        ? 'Unable to reach the highlight engine. Please try again shortly.'
        : err?.message;
      setReelError(friendly || 'An unexpected error occurred');
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
        const message = await parseErrorResponse(response, 'Failed to download file');
        throw new Error(message);
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
      const friendly = err?.message?.includes('Failed to fetch')
        ? 'Download failed because the server could not be reached. Please try again.'
        : err?.message;
      setReelError(friendly || 'Download failed. Please try again.');
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

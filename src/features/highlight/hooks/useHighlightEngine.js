import { useState, useCallback, useMemo, useRef } from 'react';
import * as Sentry from '@sentry/react';
import { API_BASE_URL, API_PREFIX, API_KEY, MAX_UPLOAD_MB } from '../config/api';
import {
  trackUploadEvent,
  trackHighlightGeneration,
  trackEditingEvent,
  trackExportEvent,
} from '../../../utils/analytics.js';
import { readAuthToken } from '../../../utils/token.js';

export const buildApiUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

const deriveEnergyTag = (confidence = 0) => {
  const score = Number(confidence) || 0;
  if (score >= 0.75) return 'high';
  if (score >= 0.45) return 'medium';
  return 'low';
};

const normalizeManifestEntry = (entry) => {
  if (!entry) return null;
  const previewSource = entry.preview_url || entry.cached_clip_url || entry.clip_url;
  const normalized = {
    ...entry,
    clip_url: entry.clip_url ? buildApiUrl(entry.clip_url) : null,
    cached_clip_url: entry.cached_clip_url ? buildApiUrl(entry.cached_clip_url) : null,
    preview_url: previewSource ? buildApiUrl(previewSource) : null,
    thumbnail_url: entry.thumbnail_url ? buildApiUrl(entry.thumbnail_url) : null,
  };
  return normalized;
};

export const getAuthHeaders = () => {
  const stored = readAuthToken();
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
  const ingestMetaRef = useRef({});
  const analysisStartRef = useRef(null);
  const reelStartRef = useRef(null);

  /**
   * Upload and analyze a video file
   */
  const handleUpload = useCallback(async (file, ingestMeta = {}) => {
    if (!file) {
      setError('Please select a video file.');
      trackUploadEvent('validation_error', { reason: 'missing_file' });
      return;
    }

    if (!file.type.startsWith('video/')) {
      setError('Unsupported file type. Please upload an MP4 or MOV video file.');
      trackUploadEvent('validation_error', { reason: 'unsupported_type', file_type: file.type });
      return;
    }

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`File exceeds ${MAX_UPLOAD_MB}MB limit. Please upload a smaller clip.`);
      trackUploadEvent('validation_error', {
        reason: 'file_too_large',
        file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
      });
      return;
    }

    const ingestSource = ingestMeta?.source || 'manual_upload';
    const ingestPlatform = ingestMeta?.platform;
    const ingestKind = ingestMeta?.kind;

    ingestMetaRef.current = { source: ingestSource, platform: ingestPlatform, kind: ingestKind };
    analysisStartRef.current =
      typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

    // Reset state
    setProcessing(true);
    setError(null);
    setResult(null);
    setStatus('Uploading file…');
    setSessionId(null);
    setReel(null);
    setReelError(null);
    setSelectedSegments([]);
    trackUploadEvent('start', {
      file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
      file_type: file.type,
      ingest_source: ingestSource,
      ingest_platform: ingestPlatform,
      ingest_kind: ingestKind || 'upload',
    });

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

      const analysisDuration =
        analysisStartRef.current != null
          ? Math.round(
              (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) -
                analysisStartRef.current
            )
          : null;

      setResult(payload);
      setSessionId(payload.session_id || null);
      trackUploadEvent('success', {
        session_id: payload.session_id,
        segments: payload.segments?.length || 0,
        ingest_source: ingestSource,
        ingest_platform: ingestPlatform,
        ingest_kind: ingestKind || 'upload',
        analysis_duration_ms: analysisDuration,
      });

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
      trackUploadEvent('error', {
        message: fallback || err?.message,
        ingest_source: ingestSource,
        ingest_platform: ingestPlatform,
        ingest_kind: ingestKind || 'upload',
        analysis_duration_ms:
          analysisStartRef.current != null
            ? Math.round(
                (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) -
                  analysisStartRef.current
              )
            : null,
      });
    } finally {
      setProcessing(false);
    }
  }, []);

  /**
   * Toggle segment selection
   */
  const toggleSegment = useCallback(
    (segmentId) => {
      setSelectedSegments((prev) => {
        const exists = prev.includes(segmentId);
        const nextSelection = exists ? prev.filter((id) => id !== segmentId) : [...prev, segmentId];
        trackEditingEvent('segment_toggle', {
          segment_id: segmentId,
          selected: !exists,
          session_id: sessionId,
        });
        return nextSelection;
      });
    },
    [sessionId]
  );

  /**
   * Create a highlight reel from selected segments
   */
  const createReel = useCallback(async () => {
    if (!sessionId) {
      setReelError('No session ID available');
      trackHighlightGeneration('validation_error', { reason: 'missing_session' });
      return;
    }

    if (selectedSegments.length === 0) {
      setReelError('Please select at least one segment');
      trackHighlightGeneration('validation_error', { reason: 'no_segments', session_id: sessionId });
      return;
    }

    if (reelLoading) return;

    reelStartRef.current =
      typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    setReelLoading(true);
    setReelError(null);
    setReel(null);
    trackHighlightGeneration('request', {
      session_id: sessionId,
      selected_segments: selectedSegments.length,
      style,
      ingest_source: ingestMetaRef.current?.source,
      ingest_platform: ingestMetaRef.current?.platform,
    });

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
      if (payload?.segment_manifest?.length) {
        setResult((prev) => (prev ? { ...prev, segment_manifest: payload.segment_manifest } : prev));
      }
      const generationDuration =
        reelStartRef.current != null
          ? Math.round(
              (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) -
                reelStartRef.current
            )
          : null;

      trackHighlightGeneration('success', {
        session_id: sessionId,
        clip_count: payload?.segments?.length || 0,
        duration: payload?.duration || null,
        generation_duration_ms: generationDuration,
        ingest_source: ingestMetaRef.current?.source,
        ingest_platform: ingestMetaRef.current?.platform,
      });
    } catch (err) {
      console.error('Reel creation error:', err);
      captureHighlightError(err, 'create_reel');
      const friendly = err?.message?.includes('Failed to fetch')
        ? 'Unable to reach the highlight engine. Please try again shortly.'
        : err?.message;
      setReelError(friendly || 'An unexpected error occurred');
      trackHighlightGeneration('error', {
        session_id: sessionId,
        message: friendly || err?.message,
        generation_duration_ms:
          reelStartRef.current != null
            ? Math.round(
                (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) -
                  reelStartRef.current
              )
            : null,
        ingest_source: ingestMetaRef.current?.source,
        ingest_platform: ingestMetaRef.current?.platform,
      });
    } finally {
      setReelLoading(false);
    }
  }, [sessionId, reelLoading, selectedSegments, style]);

  /**
   * Download a file from a URL
   */
  const handleDownload = useCallback(
    async (url, filename, metadata = {}) => {
      if (!url) {
        console.error('No URL provided for download');
        return;
      }

      const assetType = metadata.asset_type || filename;
      trackExportEvent(assetType, {
        phase: 'start',
        session_id: sessionId,
      });

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
        trackExportEvent(assetType, {
          phase: 'success',
          session_id: sessionId,
          bytes: blob.size,
        });
      } catch (err) {
        console.error('Download error:', err);
        captureHighlightError(err, 'download_asset');
        const friendly = err?.message?.includes('Failed to fetch')
          ? 'Download failed because the server could not be reached. Please try again.'
          : err?.message;
        setReelError(friendly || 'Download failed. Please try again.');
        trackExportEvent(assetType, {
          phase: 'error',
          session_id: sessionId,
          message: friendly || err?.message,
        });
      }
    },
    [sessionId]
  );

  const normalizedReel = useMemo(() => {
    if (!reel) return null;
    const normalizedStyled = reel.styled_subtitles
      ? Object.entries(reel.styled_subtitles).reduce((acc, [styleName, entry]) => {
          acc[styleName] = {
            ...entry,
            ass_url: buildApiUrl(entry.ass_url || entry.ass),
            json_url: buildApiUrl(entry.json_url || entry.json),
          };
          return acc;
        }, {})
      : null;
    const normalizedManifest = Array.isArray(reel.segment_manifest)
      ? reel.segment_manifest.map((entry) => normalizeManifestEntry(entry)).filter(Boolean)
      : null;

    return {
      ...reel,
      download_url: buildApiUrl(reel.download_url),
      captions_url: buildApiUrl(reel.captions_url),
      timeline_url: buildApiUrl(reel.timeline_url),
      styled_subtitles: normalizedStyled,
      segment_manifest: normalizedManifest,
    };
  }, [reel]);

  const manifestEntries = useMemo(() => {
    if (Array.isArray(result?.segment_manifest) && result.segment_manifest.length) {
      return result.segment_manifest.map((entry) => normalizeManifestEntry(entry)).filter(Boolean);
    }
    if (normalizedReel?.segment_manifest?.length) {
      return normalizedReel.segment_manifest;
    }
    return [];
  }, [result?.segment_manifest, normalizedReel]);

  const normalizedSegments = useMemo(() => {
    const baseSegments = Array.isArray(result?.segments) ? result.segments : [];
    if (!baseSegments.length && manifestEntries.length) {
      return manifestEntries;
    }
    const manifestMap = new Map();
    manifestEntries.forEach((entry) => {
      if (entry?.segment_id != null) {
        manifestMap.set(entry.segment_id, entry);
      }
    });

    return baseSegments.map((segment) => {
      const manifest = manifestMap.get(segment.segment_id);
      const fallbackClip = buildApiUrl(segment.clip_url);
      const previewUrl = manifest?.preview_url || manifest?.clip_url || fallbackClip;
      const thumbnailUrl = manifest?.thumbnail_url || segment.thumbnail_url;

      return {
        ...segment,
        clip_url: previewUrl || fallbackClip,
        preview_url: previewUrl || fallbackClip,
        thumbnail_url: thumbnailUrl ? buildApiUrl(thumbnailUrl) : null,
        energy: manifest?.energy || segment.energy || deriveEnergyTag(segment.confidence),
      };
    });
  }, [result, manifestEntries]);

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

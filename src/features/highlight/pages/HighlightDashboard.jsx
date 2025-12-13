import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Form, Alert, Table } from 'react-bootstrap';
import HighlightUploadPanel from '../components/HighlightUploadPanel';
import HighlightStatusCard from '../components/HighlightStatusCard';
import HighlightFeedbackCTA from '../components/HighlightFeedbackCTA';
import ProcessingStatusList from '../components/ProcessingStatusList';
import useHighlightEngine from '../hooks/useHighlightEngine';
import { trackButtonClick, trackEditingEvent } from '../../../utils/analytics.js';
import { requestAutoPost, fetchAutoPostJobs, fetchAutoPostStatus } from '../api/autopost';
import { fetchProfile } from '../../../api/profile';
import { readAuthToken } from '../../../utils/token.js';

const AUTH_STORAGE_KEY = 'mediaveed_jwt';

const stats = [
  { label: 'Clips analyzed', value: '12K+' },
  { label: 'Avg turnaround', value: '45s' },
  { label: 'Formats ready', value: 'MP4 / SRT / JSON' },
];

const presetClips = [
  { title: 'Anime Beat', tag: '00:12', color: 'amber' },
  { title: 'Dance Loop', tag: '00:08', color: 'bronze' },
  { title: 'Pro Play', tag: '00:15', color: 'sand' },
];

const ENERGY_META = {
  high: { label: 'High energy', icon: '🔥' },
  medium: { label: 'Balanced energy', icon: '⚡' },
  low: { label: 'Chill energy', icon: '🌙' },
};

const formatDuration = (seconds = 0) => {
  if (!seconds || Number.isNaN(seconds)) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const getSegmentDuration = (segment = {}) => {
  const direct = Number(segment.duration);
  if (Number.isFinite(direct)) {
    return direct;
  }
  const start = Number(segment.start ?? 0);
  const end = Number(segment.end ?? 0);
  const fallback = end - start;
  return Number.isFinite(fallback) ? fallback : 0;
};

const getBoundary = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const highlightBetaUnlocked = import.meta.env.VITE_HIGHLIGHT_BETA_UNLOCKED === 'true';

const HighlightDashboard = ({
  autoVideoDownloadUrl = '',
  autoVideoTitle = '',
  autoVideoCompletedAt = null,
  autoVideoPlatform = '',
  autoVideoKind = '',
  // showBackButton = false,
  // onBack,
  onAutoProcessingComplete,
}) => {
  const {
    normalizedSegments,
    result,
    error,
    processing,
    status,
    setStatus,
    sessionId,
    reel,
    reelLoading,
    reelError,
    style,
    setStyle,
    selectedSegments,
    selectedCount,
    totalSegments,
    canCreateReel,
    toggleSegment,
    createReel,
    handleDownload,
    handleUpload,
  } = useHighlightEngine();

  const autoProcessedRef = useRef(null);
  const [autoProcessingActive, setAutoProcessingActive] = useState(false);
  const [plan, setPlan] = useState('free');
  const [planLoading, setPlanLoading] = useState(false);
  const [autoPostLoading, setAutoPostLoading] = useState(false);
  const [autoPostJobs, setAutoPostJobs] = useState([]);
  const [autoPostError, setAutoPostError] = useState('');
  const [autoPostMessage, setAutoPostMessage] = useState('');
  const [autoPostPlatforms, setAutoPostPlatforms] = useState([]);
  const [autoPostForm, setAutoPostForm] = useState({
    platform: 'tiktok',
    caption: '',
  });
  const [previewingSegment, setPreviewingSegment] = useState(null);

  const handleTryAnother = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const readToken = useCallback(() => readAuthToken(), []);

  const refreshPlan = useCallback(() => {
    const token = readToken();
    if (!token) {
      setPlan('free');
      setPlanLoading(false);
      return;
    }
    setPlanLoading(true);
    fetchProfile()
      .then((payload) => {
        setPlan((payload && payload.plan) || 'free');
      })
      .catch(() => {
        setPlan('free');
      })
      .finally(() => {
        setPlanLoading(false);
      });
  }, [readToken]);

  useEffect(() => {
    refreshPlan();
  }, [refreshPlan]);

  const configuredAutoPlatforms = autoPostPlatforms.filter((entry) => entry.configured);
  const autoPostReady = configuredAutoPlatforms.length > 0;

  const refreshAutoPostJobs = useCallback(() => {
    fetchAutoPostJobs()
      .then((jobs) => setAutoPostJobs(Array.isArray(jobs) ? jobs : []))
      .catch(() => setAutoPostJobs([]));
  }, []);

  useEffect(() => {
    refreshAutoPostJobs();
  }, [refreshAutoPostJobs]);

  const refreshAutoPostStatus = useCallback(() => {
    fetchAutoPostStatus()
      .then((payload) => {
        const platforms = Array.isArray(payload?.platforms) ? payload.platforms : [];
        setAutoPostPlatforms(platforms);
      })
      .catch(() => setAutoPostPlatforms([]));
  }, []);

  useEffect(() => {
    refreshAutoPostStatus();
  }, [refreshAutoPostStatus]);

  useEffect(() => {
    if (!configuredAutoPlatforms.length) {
      return;
    }
    setAutoPostForm((prev) => {
      const currentConfigured = configuredAutoPlatforms.find((entry) => entry.id === prev.platform);
      if (currentConfigured) {
        return prev;
      }
      return { ...prev, platform: configuredAutoPlatforms[0].id };
    });
  }, [configuredAutoPlatforms]);

  const handleAutoPostChange = (event) => {
    const { name, value } = event.target;
    setAutoPostForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoPostSubmit = async (event) => {
    event.preventDefault();
    if (!autoPostReady) {
      setAutoPostError('Auto-posting is coming soon while we finalize connectors.');
      return;
    }
    if (!sessionId) {
      setAutoPostError('Generate a highlight reel before auto-posting.');
      return;
    }
    setAutoPostError('');
    setAutoPostMessage('');
    setAutoPostLoading(true);
    try {
      await requestAutoPost({
        session_id: sessionId,
        platform: autoPostForm.platform,
        caption: autoPostForm.caption || undefined,
      });
      setAutoPostMessage('Auto-post requested. Status updates will appear below.');
      setAutoPostForm((prev) => ({ ...prev, caption: '' }));
      refreshAutoPostJobs();
    } catch (err) {
      setAutoPostError(err.message || 'Unable to schedule auto-post.');
    } finally {
      setAutoPostLoading(false);
    }
  };

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === AUTH_STORAGE_KEY) {
        refreshPlan();
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = window.setInterval(refreshPlan, 4000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(interval);
    };
  }, [refreshPlan]);

  useEffect(() => {
    const currentAutoKey = autoVideoDownloadUrl
      ? `${autoVideoDownloadUrl}__${autoVideoCompletedAt || ''}`
      : null;

    if (!currentAutoKey) {
      autoProcessedRef.current = null;
      setAutoProcessingActive(false);
      return;
    }

    if (autoProcessedRef.current === currentAutoKey) {
      return;
    }

    autoProcessedRef.current = currentAutoKey;
    setAutoProcessingActive(true);
    if (typeof onAutoProcessingComplete === 'function') {
      onAutoProcessingComplete();
    }

    (async () => {
      try {
        setStatus('Fetching downloaded video…');
        const response = await fetch(autoVideoDownloadUrl);
        if (!response.ok) {
          throw new Error('Unable to fetch downloaded video');
        }
        const blob = await response.blob();
        const fileName = autoVideoTitle
          ? `${autoVideoTitle.replace(/[^\w\d]+/g, '_')}.mp4`
          : `mediaveed_${Date.now()}.mp4`;
        const file = new File([blob], fileName, { type: blob.type || 'video/mp4' });
        await handleUpload(file, {
          source: 'downloader',
          platform: autoVideoPlatform || undefined,
          kind: autoVideoKind || 'video',
        });
      } catch (err) {
        console.error('Auto-upload failed:', err);
        setStatus('Automatic processing failed. Please upload manually.');
      } finally {
        setAutoProcessingActive(false);
      }
    })();
  }, [
    autoVideoCompletedAt,
    autoVideoDownloadUrl,
    autoVideoTitle,
    autoVideoPlatform,
    autoVideoKind,
    handleUpload,
    onAutoProcessingComplete,
    setStatus,
  ]);

  const totalDurationSeconds = normalizedSegments.reduce(
    (acc, segment) => acc + getSegmentDuration(segment),
    0
  );

  const averageDuration = normalizedSegments.length
    ? totalDurationSeconds / normalizedSegments.length
    : 0;

  const averageConfidence = normalizedSegments.length
    ? normalizedSegments.reduce((acc, segment) => acc + (segment.confidence || 0), 0) /
      normalizedSegments.length
    : 0;

  const hasStatus = Boolean(status || error);
  const statusLabel = error ? 'Action required' : processing ? 'Working on it' : 'Ready for review';
  const statusSubtitle = error
    ? 'Verify the video format, duration, or try trimming before uploading again.'
    : processing
      ? 'We are mapping peaks in motion, color, and dialogue.'
      : 'Highlights are ready — curate your reel below.';

  const feedbackBaseUrl = import.meta.env.VITE_HIGHLIGHT_FEEDBACK_URL;
  const feedbackHref = useMemo(() => {
    if (!feedbackBaseUrl) return null;
    const params = new URLSearchParams();
    if (sessionId) params.set('session_id', sessionId);
    const title = result?.reference || autoVideoTitle;
    if (title) params.set('title', title);
    if (params.toString()) {
      return `${feedbackBaseUrl}${feedbackBaseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
    }
    return feedbackBaseUrl;
  }, [feedbackBaseUrl, sessionId, result?.reference, autoVideoTitle]);

  const handleStyleChange = useCallback(
    (event) => {
      const nextStyle = event.target.value;
      setStyle(nextStyle);
      trackEditingEvent('style_change', { style: nextStyle, session_id: sessionId });
    },
    [sessionId, setStyle]
  );

  return (
    <div className="gold-app">
      {/* {showBackButton && typeof onBack === 'function' && (
        <div className="mediaveed-back-row">
          <button type="button" className="mediaveed-back-button" onClick={onBack}>
            ← Back
          </button>
        </div>
      )} */}
      {autoProcessingActive && (
        <HighlightStatusCard
          variant="processing"
          title="Auto-processing"
          message={
            autoVideoTitle
              ? `Analyzing “${autoVideoTitle}” automatically`
              : 'Analyzing downloaded video'
          }
          hint="Hang tight while we detect highlight moments."
        />
      )}
      <section className="hero-shell rounded-4 mb-5">
        <Row className="align-items-center gy-4">
          <Col lg={6}>
            <Badge pill className="tracking-wide hero-pill mb-2">
              {planLoading
                ? 'Checking plan…'
                : highlightBetaUnlocked
                  ? 'Beta access · All tiers unlocked'
                  : plan === 'free'
                    ? 'Free tier · Watermarked exports'
                    : `Plan: ${plan}`}
            </Badge>
            <h1 className="display-4 fw-bold text-light mb-3">
              Craft reels the <span className="text-gradient">MediaVeed</span> way.
            </h1>
            <p className="text-muted-luxe pe-lg-4">
              Upload, analyze, and stitch cinematic cuts without scrubbing timelines. We map
              dialogue spikes, camera motion, and rhythm so you can focus on storytelling.
            </p>
            <Row className="g-3 mt-3">
              {stats.map((stat) => (
                <Col sm={4} xs={6} key={stat.label}>
                  <Card className="stat-card border-0">
                    <Card.Body>
                      <h5 className="text-light mb-0">{stat.value}</h5>
                      <small className="text-muted-luxe">{stat.label}</small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
          <Col lg={6}>
            <div className="hero-frames">
              {presetClips.map((clip) => (
                <div className={`frame-card clip-${clip.color}`} key={clip.title}>
                  <div className="frame-overlay" />
                  <div className="frame-meta">
                    <p>{clip.title}</p>
                    <span>{clip.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
        <div className="hero-upload mt-4">
          <HighlightUploadPanel
            isProcessing={processing}
            error={error}
            statusMessage={status}
            onFileSelected={(file) =>
              handleUpload(file, {
                source: 'manual_upload',
                platform: 'local_file',
                kind: 'upload',
              })
            }
          />
        </div>
      </section>

      {hasStatus && (
        <HighlightStatusCard
          variant={error ? 'error' : processing ? 'processing' : 'success'}
          title={statusLabel}
          message={error || status}
          hint={statusSubtitle}
        />
      )}

      <HighlightFeedbackCTA sessionId={sessionId} title={result?.reference || autoVideoTitle} />

      <Container className="mb-5">
        {processing && (
          <section className="processing-panel my-5" aria-live="polite">
            <div className="processing-panel__header">
              <div className="loader-gold large" aria-hidden="true" />
              <div className="flex-grow-1">
                <p className="processing-panel__title mb-1">
                  {status || 'Processing your video…'}
                </p>
                <p className="text-muted-luxe mb-0">
                  This can take up to a minute — keep this tab open.
                </p>
              </div>
            </div>
            <ProcessingStatusList processing={processing} statusMessage="Realtime analysis log" />
          </section>
        )}

        {!result && !processing && (
          <HighlightStatusCard
            variant="info"
            title="Highlight Generator"
            message="Upload a video to start detecting highlight segments."
            hint="We’ll surface the highest-energy clips in seconds."
          />
        )}

        {result && normalizedSegments.length > 0 && (
          <>
            <Row className="g-3 analysis-summary mb-4">
              <Col md={4}>
                <div className="insight-chip">
                  <span className="chip-label">Segments detected</span>
                  <strong>{totalSegments}</strong>
                  <small>Energy-ranked cuts</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="insight-chip">
                  <span className="chip-label">Time covered</span>
                  <strong>{formatDuration(totalDurationSeconds)}</strong>
                  <small>Combined duration</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="insight-chip">
                  <span className="chip-label">Avg. energy</span>
                  <strong>{Math.round(averageConfidence * 100)}%</strong>
                  <small>{formatDuration(averageDuration)} / segment</small>
                </div>
              </Col>
            </Row>

            <Row className="g-4 mb-4 segment-grid">
              {normalizedSegments.map((segment) => {
                const isSelected = selectedSegments.includes(segment.segment_id);
                const duration = getSegmentDuration(segment);
                const start = getBoundary(segment.start);
                const end = getBoundary(segment.end);
                const confidence = Math.round((segment.confidence || 0) * 100);
                const previewUrl = segment.preview_url || segment.clip_url;
                const thumbnailUrl = segment.thumbnail_url;
                const canPreview = Boolean(previewUrl);
                const isPreviewing = previewingSegment === segment.segment_id && canPreview;
                const energyLevel = (segment.energy || 'medium').toLowerCase();
                const energyMeta = ENERGY_META[energyLevel] || ENERGY_META.medium;
                const energyLabel = `${energyMeta.icon} ${energyMeta.label}`;
                const previewToggleLabel = isPreviewing ? 'Close preview' : 'Preview clip';

                return (
                  <Col md={6} lg={4} key={segment.segment_id}>
                    <Card className={`segment-card segment-card--modern ${isSelected ? 'active' : ''}`}>
                      <div className="segment-media">
                        {canPreview ? (
                          isPreviewing ? (
                            <div className="segment-media__preview-shell">
                              <video
                                src={previewUrl}
                                className="segment-media__preview"
                                playsInline
                                controls
                                crossOrigin="anonymous"
                                muted
                                autoPlay
                                preload="auto"
                                poster={thumbnailUrl || undefined}
                              />
                              <button
                                type="button"
                                className="segment-media__preview-btn segment-media__preview-btn--floating"
                                onClick={() => setPreviewingSegment(null)}
                              >
                                Close preview
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`segment-media__thumbnail ${thumbnailUrl ? '' : 'segment-media__thumbnail--placeholder'}`}
                              style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
                            >
                              <button
                                type="button"
                                className="segment-media__preview-btn"
                                onClick={() =>
                                  setPreviewingSegment((current) =>
                                    current === segment.segment_id ? null : segment.segment_id
                                  )
                                }
                              >
                                {previewToggleLabel}
                              </button>
                              <span className="segment-media__hint">Uses cached MP4 for instant preview</span>
                            </div>
                          )
                        ) : (
                          <div className="segment-media__thumbnail segment-media__thumbnail--placeholder">
                            Clip processing…
                          </div>
                        )}
                        {isSelected && <div className="segment-media__selected">Selected</div>}
                      </div>
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className={`energy-chip energy-chip--${energyLevel}`}>{energyLabel}</span>
                          <span className="duration-pill">{duration.toFixed(1)}s</span>
                        </div>
                        <div className="segment-meta-grid">
                          <div>
                            <p className="meta-label">Segment</p>
                            <p className="meta-value">#{String(segment.segment_id).padStart(2, '0')}</p>
                          </div>
                          <div>
                            <p className="meta-label">Energy</p>
                            <p className="meta-value">{confidence}% vibe</p>
                          </div>
                          <div>
                            <p className="meta-label">Range</p>
                            <p className="meta-value">{start.toFixed(1)}s → {end.toFixed(1)}s</p>
                          </div>
                        </div>
                        <p className="text-light fw-semibold mb-1">
                          {segment.caption || 'Highlight segment'}
                        </p>
                        <p className="text-muted-luxe small mb-3">
                          {segment.category || 'Momentum spike'}
                        </p>
                        <div className="segment-card__actions">
                          <Button
                            variant={isSelected ? 'warning' : 'outline-light'}
                            size="sm"
                            className="flex-grow-1 w-100"
                            onClick={() => toggleSegment(segment.segment_id)}
                          >
                            {isSelected ? 'Selected' : 'Select segment'}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            <Card className="compile-panel border-0 mb-4">
              <Card.Body className="p-3">
                <Row className="align-items-center gy-3">
                  <Col md={8}>
                    <p className="text-muted-luxe mb-2">
                      {selectedCount}/{totalSegments} segments selected
                    </p>
                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <div className="flex-grow-1">
                        <label className="text-muted-luxe small mb-1 d-block">Style preset</label>
                        <select
                          className="form-select form-select-sm"
                          value={style}
                          onChange={handleStyleChange}
                        >
                          <option value="variety">Variety + Energy Curve</option>
                          <option value="story">Story Flow</option>
                        </select>
                        <small className="text-muted-luxe d-block mt-1">
                          Keep selections under 60 seconds for smooth pacing.
                        </small>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <Button
                      variant="warning"
                      className="fw-semibold px-4"
                      disabled={!canCreateReel || reelLoading}
                      onClick={() => {
                        trackButtonClick('create-highlight', { location: 'highlight_dashboard' });
                        createReel();
                      }}
                    >
                      {reelLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Stitching…
                        </>
                      ) : (
                        'Create Highlight'
                      )}
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </>
        )}

        {reelError && (
          <div className="alert alert-danger text-center" role="alert">
            {reelError}
          </div>
        )}

        {reel && (
          <Card className="reel-panel border-0">
            <Card.Body>
              <div className="reel-success-state">
                <div className="reel-success-icon" aria-hidden="true">
                  ✅
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-1 text-light">Highlight reel is ready</h5>
                  <p className="mb-0 text-muted-luxe">
                    Downloads stay available while this tab is open. Save the MP4, captions, or timeline now.
                  </p>
                </div>
                {feedbackHref && (
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      trackButtonClick('highlight-feedback-complete', {
                        location: 'highlight_reel_ready',
                        session_id: sessionId,
                      });
                      window.open(feedbackHref, '_blank');
                    }}
                  >
                    Share feedback
                  </Button>
                )}
                <Button variant="outline-light" size="sm" onClick={handleTryAnother}>
                  Try another video
                </Button>
              </div>
              <Row className="g-4 align-items-center">
                <Col lg={6}>
                  <h5 className="text-light mb-3">Your highlight reel</h5>
                  <p className="text-muted-luxe">Download assets or share the stitched clip directly.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="warning"
                      className="fw-semibold"
                      onClick={() =>
                        handleDownload(reel.download_url, 'highlight_reel.mp4', {
                          asset_type: 'highlight_reel_mp4',
                        })
                      }
                      aria-live="polite"
                    >
                      Download MP4
                    </Button>
                    {reel.captions_url && (
                      <Button
                        variant="outline-light"
                        onClick={() =>
                          handleDownload(reel.captions_url, 'captions.srt', {
                            asset_type: 'highlight_captions_srt',
                          })
                        }
                      >
                        Captions (SRT)
                      </Button>
                    )}
                    {reel.timeline_url && (
                      <Button
                        variant="outline-light"
                        onClick={() =>
                          handleDownload(reel.timeline_url, 'timeline.json', {
                            asset_type: 'highlight_timeline_json',
                          })
                        }
                      >
                        Timeline (JSON)
                      </Button>
                    )}
                  </div>
                  {reel.styled_subtitles && (
                    <div className="mt-3">
                      <p className="text-muted-luxe mb-1">AI subtitle packs</p>
                      <div className="d-flex flex-wrap gap-2">
                        {Object.entries(reel.styled_subtitles).map(([styleName, entry]) => (
                          <React.Fragment key={styleName}>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleDownload(entry.ass_url, `${styleName}.ass`)}
                            >
                              {entry.label} (ASS)
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleDownload(entry.json_url, `${styleName}.json`)}
                            >
                              {entry.label} preset
                            </Button>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </Col>
                <Col lg={6}>
                  {reel.download_url && (
                    <div className="reel-preview-wrap">
                      <video
                        src={reel.download_url}
                        className="reel-video"
                        controls
                        playsInline
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {reel && (
          <Card className="reel-panel border-0 mt-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="text-light mb-1">Auto-post to social</h5>
                  <p className="text-muted-luxe mb-0">
                    Publish this reel directly to TikTok, Shorts, or Reels (Pro plans).
                  </p>
                </div>
              </div>
              {!autoPostReady ? (
                <Alert variant="info" className="mb-0">
                  Auto-post publishing is coming soon while we finalize platform credentials.
                </Alert>
              ) : (
                <Form onSubmit={handleAutoPostSubmit}>
                  <Row className="g-3 align-items-end">
                    <Col md={4}>
                      <Form.Label className="text-muted-luxe small">Platform</Form.Label>
                      <Form.Select
                        name="platform"
                        value={autoPostForm.platform}
                        onChange={handleAutoPostChange}
                      >
                        {configuredAutoPlatforms.map((entry) => (
                          <option value={entry.id} key={entry.id}>
                            {entry.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="text-muted-luxe small">Caption (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="caption"
                        value={autoPostForm.caption}
                        maxLength={2200}
                        placeholder="Add a short caption"
                        onChange={handleAutoPostChange}
                      />
                    </Col>
                    <Col md={2}>
                      <Button
                        type="submit"
                        variant="warning"
                        className="w-100"
                        disabled={autoPostLoading}
                      >
                        {autoPostLoading ? 'Scheduling…' : 'Queue post'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
              {autoPostError && (
                <Alert variant="danger" className="mt-3 mb-0">
                  {autoPostError}
                </Alert>
              )}
              {autoPostMessage && (
                <Alert variant="success" className="mt-3 mb-0">
                  {autoPostMessage}
                </Alert>
              )}
              <div className="mt-4">
                {autoPostJobs.length === 0 ? (
                  <small className="text-muted-luxe">
                    After you schedule an auto-post, job status will appear here.
                  </small>
                ) : (
                  <div className="table-responsive">
                    <Table bordered hover variant="dark" size="sm">
                      <thead>
                        <tr>
                          <th>Platform</th>
                          <th>Status</th>
                          <th>Caption</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {autoPostJobs.map((job) => (
                          <tr key={job.id}>
                            <td>{job.platform_label || job.platform}</td>
                            <td className={`status-${job.status}`}>{job.status}</td>
                            <td>{job.caption || '—'}</td>
                            <td>
                              {new Date(
                                (job.updated_at || job.created_at || 0) * 1000
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default HighlightDashboard;

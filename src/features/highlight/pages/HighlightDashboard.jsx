import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import HighlightUploadPanel from '../components/HighlightUploadPanel';
import HighlightStatusCard from '../components/HighlightStatusCard';
import HighlightFeedbackCTA from '../components/HighlightFeedbackCTA';
import useHighlightEngine from '../hooks/useHighlightEngine';

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

const HighlightDashboard = ({
  autoVideoDownloadUrl = '',
  autoVideoTitle = '',
  autoVideoCompletedAt = null,
  showBackButton = false,
  onBack,
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
        await handleUpload(file);
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

  return (
    <div className="gold-app">
      {showBackButton && typeof onBack === 'function' && (
        <div className="mediaveed-back-row">
          <button type="button" className="mediaveed-back-button" onClick={onBack}>
            ← Back
          </button>
        </div>
      )}
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
              Highlight Engine
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
            onFileSelected={handleUpload}
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
          <section className="processing-panel text-center my-5">
            <div className="loader-gold large" aria-hidden="true" />
            <p className="text-light fw-semibold mt-3 mb-1">
              {status || 'Processing your video…'}
            </p>
            <p className="text-muted-luxe mb-0">
              This can take up to a minute — keep this tab open.
            </p>
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

                return (
                  <Col md={6} lg={4} key={segment.segment_id}>
                    <Card className={`segment-card ${isSelected ? 'active' : ''}`}>
                      {segment.clip_url ? (
                        <video
                          src={segment.clip_url}
                          controls
                          playsInline
                          className="segment-video"
                          preload="metadata"
                        />
                      ) : (
                        <div className="segment-video placeholder">Clip processing…</div>
                      )}
                      <Card.Body>
                        <div className="segment-pills mb-2">
                          <Badge bg="dark" className="segment-pill">
                            #{String(segment.segment_id).padStart(2, '0')}
                          </Badge>
                          <Badge bg="warning" className="segment-pill text-dark">
                            {duration.toFixed(1)}s
                          </Badge>
                          <Badge bg="secondary" className="segment-pill">
                            {confidence}% energy
                          </Badge>
                        </div>
                        <div className="segment-timeline text-muted-luxe small">
                          <span>{start.toFixed(2)}s</span>
                          <span>{end.toFixed(2)}s</span>
                        </div>
                        <p className="text-light fw-semibold mb-1">
                          {segment.caption || 'Highlight segment'}
                        </p>
                        <p className="text-muted-luxe small mb-3">
                          {segment.category || 'Momentum spike'}
                        </p>
                        <Button
                          variant={isSelected ? 'warning' : 'outline-light'}
                          size="sm"
                          className="w-100"
                          onClick={() => toggleSegment(segment.segment_id)}
                        >
                          {isSelected ? 'Selected' : 'Select segment'}
                        </Button>
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
                          onChange={(event) => setStyle(event.target.value)}
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
                      onClick={createReel}
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
              <Row className="g-4 align-items-center">
                <Col lg={6}>
                  <h5 className="text-light mb-3">Your highlight reel</h5>
                  <p className="text-muted-luxe">Download assets or share the stitched clip directly.</p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="warning"
                      className="fw-semibold"
                      onClick={() => handleDownload(reel.download_url, 'highlight_reel.mp4')}
                    >
                      Download MP4
                    </Button>
                    {reel.captions_url && (
                      <Button
                        variant="outline-light"
                        onClick={() => handleDownload(reel.captions_url, 'captions.srt')}
                      >
                        Captions (SRT)
                      </Button>
                    )}
                    {reel.timeline_url && (
                      <Button
                        variant="outline-light"
                        onClick={() => handleDownload(reel.timeline_url, 'timeline.json')}
                      >
                        Timeline (JSON)
                      </Button>
                    )}
                  </div>
                </Col>
                <Col lg={6}>
                  {reel.download_url && (
                    <div className="reel-preview-wrap">
                      <video src={reel.download_url} className="reel-video" controls playsInline />
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default HighlightDashboard;

import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import '../styles/highlight.css';
import HighlightStatusCard from '../components/HighlightStatusCard';
import HighlightFeedbackCTA from '../components/HighlightFeedbackCTA';
import { API_PREFIX, API_KEY } from '../config/api';
import { buildApiUrl, getAuthHeaders } from '../hooks/useHighlightEngine';

const RecentHighlights = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        buildApiUrl(`${API_PREFIX}/sessions?limit=100`),
        {
          headers: {
            ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
            ...getAuthHeaders(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load sessions (${response.status})`);
      }

      const payload = await response.json();
      setSessions(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err.message || 'Unable to load recent highlights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatTimestamp = (value) => {
    if (!value) return '—';
    const date = new Date(value * 1000);
    return date.toLocaleString();
  };

  const formatSeconds = (value) => {
    if (!value && value !== 0) return '—';
    const num = Number(value);
    if (!Number.isFinite(num)) return '—';
    if (num >= 60) {
      const mins = Math.floor(num / 60);
      const secs = Math.round(num % 60);
      return `${mins}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${num.toFixed(1)}s`;
  };

  return (
    <section className="highlight-embed">
      <div className="highlight-embed__header">
        <div className="highlight-embed__hero">
          <p className="eyebrow text-center">Operations • Internal</p>
          <h1>Recent Highlight Sessions</h1>
          <p className="subtitle">
            Monitor the latest highlight jobs during beta. Use this view to trace user issues,
            confirm processing times, and spot repeated failures quickly.
          </p>
          <div className="highlight-embed__cta">
            <Button
              variant="outline-light"
              className="cta-button secondary"
              onClick={fetchSessions}
            >
              Refresh list
            </Button>
          </div>
        </div>
      </div>

      <div className="highlight-engine-wrapper">
        <div className="highlight-engine">
          {loading && (
            <div className="placeholder-panel text-center">
              <Spinner animation="border" variant="light" />
              <p className="mt-3 mb-0 text-muted-luxe">Loading recent highlight sessions…</p>
            </div>
          )}

          {error && (
            <HighlightStatusCard
              variant="error"
              title="Failed to load sessions"
              message={error}
            />
          )}

          {!loading && !error && (
            <div className="table-responsive">
              <Table striped hover variant="dark" className="mb-4">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>User</th>
                    <th>Reference</th>
                    <th>Segments</th>
                    <th>Video</th>
                    <th>Reel</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.session_id}>
                      <td>
                        <code>{session.session_id}</code>
                      </td>
                      <td>
                        {session.user?.email || session.user?.id || '—'}
                      </td>
                      <td>{session.reference || '—'}</td>
                      <td>{session.segment_count ?? '—'}</td>
                      <td>{formatSeconds(session.video_duration)}</td>
                      <td>
                        {session.style?.label ? (
                          <span>{session.style.label}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{formatTimestamp(session.created_at)}</td>
                      <td>
                        <Badge bg={session.status === 'reel_ready' ? 'success' : 'secondary'}>
                          {session.status || 'pending'}
                        </Badge>
                      </td>
                      <td>
                        {session.processing_time_ms
                          ? formatSeconds(session.processing_time_ms / 1000)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          <HighlightFeedbackCTA />
        </div>
      </div>
    </section>
  );
};

export default RecentHighlights;

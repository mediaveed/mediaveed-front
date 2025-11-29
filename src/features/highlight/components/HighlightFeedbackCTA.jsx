import React from 'react';

const HighlightFeedbackCTA = ({ sessionId, title }) => {
  const feedbackUrl = import.meta.env.VITE_HIGHLIGHT_FEEDBACK_URL;
  if (!feedbackUrl) return null;

  const params = new URLSearchParams();
  if (sessionId) params.set('session_id', sessionId);
  if (title) params.set('title', title);

  const href = `${feedbackUrl}${feedbackUrl.includes('?') ? '&' : '?'}${params.toString()}`;

  return (
    <div className="highlight-feedback-cta">
      <div>
        <p className="feedback-eyebrow">Beta feedback</p>
        <p className="feedback-copy">
          Help improve the highlight engine — share what worked, what didn’t, and any edge cases you hit.
        </p>
      </div>
      <button
        type="button"
        className="cta-button secondary"
        onClick={() => window.open(href, '_blank')}
      >
        Submit feedback
      </button>
    </div>
  );
};

export default HighlightFeedbackCTA;

import React from 'react';
import { trackButtonClick } from '../../../utils/analytics.js';

const guideItems = [
  {
    title: 'Best video formats',
    copy: 'MP4 or MOV under 10 minutes. Aim for 1080p for cleaner highlight clips.',
  },
  {
    title: 'Speed vs quality presets',
    copy: '“Variety” balances motion + dialogue; “Story Flow” prioritizes narrative pacing.',
  },
  {
    title: 'After analysis',
    copy: 'Select up to ~60 seconds of segments for the smoothest reel pacing.',
  },
  {
    title: 'Common blockers',
    copy: 'Expired downloads, DRM-protected videos, or files over the size limit will fail early.',
  },
];

const HighlightGuide = ({ feedbackUrl }) => (
  <section className="highlight-guide mt-4">
    <div className="highlight-guide__header">
      <div>
        <p className="eyebrow mb-1">Tips &amp; best practices</p>
        <h3>Make the most of the Highlight Generator</h3>
      </div>
      {feedbackUrl && (
        <button
          type="button"
          className="cta-button secondary"
          onClick={() => {
            trackButtonClick('highlight-read-checklist', { location: 'highlight_guide' });
            window.open(feedbackUrl, '_blank');
          }}
        >
          Read beta checklist
        </button>
      )}
    </div>
    <div className="highlight-guide__grid">
      {guideItems.map((item) => (
        <div key={item.title} className="highlight-guide__card">
          <h4>{item.title}</h4>
          <p>{item.copy}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HighlightGuide;

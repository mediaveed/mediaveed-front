import React from 'react';
import { Container } from 'react-bootstrap';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import aboutContent from '../content/mediaveed/about/about.md?raw';
import './home.css';

const teamHighlights = [
  { label: 'Clips deployed', value: '48,000+' },
  { label: 'Latency saved', value: '2.1M hrs' },
  { label: 'Creator NPS', value: '67' },
];

const productPillars = [
  {
    title: 'AI highlight intelligence',
    body: 'Auto-detect pace, speaker excitement, and scene changes to curate a highlight reel in under 90 seconds.',
  },
  {
    title: 'Payments + gating baked in',
    body: 'Stripe billing, JWT auth, and plan-based processing limits live in the same engine as the editor. No patchwork.',
  },
  {
    title: 'Full export pipeline',
    body: 'Watermarking, caption styling, and auto-post jobs let teams ship social-ready clips with a single button.',
  },
];

const About = () => (
  <section className="info-shell">
    <Container>
      <div className="info-shell__header">
        <span className="info-chip">About</span>
        <h1>The highlight stack for modern creators</h1>
        <p>
          MediaVeed’s highlight engine started as an internal ops tool. It now powers complete creator pipelines—from ingest to reels—while staying builder-friendly.
        </p>
      </div>

      <div className="info-shell__grid">
        <div className="info-pane info-pane--stack">
          <p className="info-eyebrow">Origin</p>
          <h2 className="info-pane__heading">Why we built it</h2>
          <MarkdownRenderer content={aboutContent} />
          <div className="info-stats">
            {teamHighlights.map((stat) => (
              <div className="info-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="info-pane info-pane--accent info-pane--stack">
          <p className="info-eyebrow">Pillars</p>
          {productPillars.map((pillar) => (
            <div key={pillar.title}>
              <h3 className="info-pane__heading">{pillar.title}</h3>
              <p className="info-pane__subtext">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  </section>
);

export default About;

import React from 'react';
import { Container } from 'react-bootstrap';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import metadataContent from '../content/mediaveed/metadata/metadata.md?raw';
import './home.css';

const metadataCards = [
  {
    label: 'SEO Bundles',
    title: 'Landing + blog meta sets',
    body: 'Copy-ready titles, descriptions, and OG tags tuned for the highlight engine vertical.',
  },
  {
    label: 'Campaign Boosters',
    title: 'Ad + social snippets',
    body: 'Paid social hooks, TikTok captions, and UTM examples to ship creative faster.',
  },
  {
    label: 'Press Kit',
    title: 'Boilerplate messaging',
    body: 'Investor one-liners, founder bios, and product blurbs in one canonical doc.',
  },
];

const Metadata = () => (
  <section className="info-shell">
    <Container>
      <div className="info-shell__header">
        <span className="info-chip">Metadata</span>
        <h1>Pre-built content blocks for every launch</h1>
        <p>
          Drop these snippets into landing pages, blog posts, or campaign briefs—no copywriter required. Everything below is sourced from the Mediaveed content pack.
        </p>
      </div>

      <div className="metadata-grid">
        {metadataCards.map((card) => (
          <div className="metadata-card" key={card.label}>
            <span>{card.label}</span>
            <h4>{card.title}</h4>
            <p>{card.body}</p>
          </div>
        ))}
      </div>

      <div className="info-pane">
        <p className="info-eyebrow">Full library</p>
        <h2 className="info-pane__heading">Use the snippets as-is</h2>
        <MarkdownRenderer content={metadataContent} />
      </div>
    </Container>
  </section>
);

export default Metadata;

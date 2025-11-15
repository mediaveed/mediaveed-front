import React from 'react';
import './home.css';
import { Container } from 'react-bootstrap';

const featureCards = [
  {
    title: 'Multi-Platform Support',
    description: 'Download from YouTube, TikTok, Instagram, and X without switching tools.',
    icon: '🌐',
  },
  {
    title: 'Audio + Video',
    description: 'Instantly switch between MP4 video and MP3 audio in just one click.',
    icon: '🎧',
  },
  {
    title: 'High Quality',
    description: 'Crystal clear 1080p/720p outputs with studio-grade audio extraction.',
    icon: '💎',
  },
  {
    title: 'Fast Servers',
    description: 'Edge-optimized servers keep conversions under a minute in most cases.',
    icon: '⚡',
  },
  {
    title: 'No Accounts',
    description: 'No registration, no e-mail spam—just paste, convert, and download.',
    icon: '🔒',
  },
  {
    title: 'Works Everywhere',
    description: 'Use MediaVeed on desktop, tablet, or phone with the same polished UI.',
    icon: '📱',
  },
];

const Features = () => (
  <section className="features-page">
    <div className="features-hero">
      <div>
        <p className="info-eyebrow">What You Can Do with MediaVeed</p>
        <h1>Full-stack downloading power</h1>
        <p>
          MediaVeed wraps every step—link detection, extraction, conversion, and download—into
          one cohesive experience. No extra apps, no time wasted.
        </p>
      </div>
      <div className="features-hero-art" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
    </div>
        <Container>

            <div className="features-card-grid">
              {featureCards.map((card) => (
                <article className="feature-pill" key={card.title}>
                  <span className="feature-pill__icon">{card.icon}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>
        </Container>
  </section>
);

export default Features;

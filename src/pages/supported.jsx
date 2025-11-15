import React from 'react';
import './home.css';
import { Container } from 'react-bootstrap';

const supportedPlatforms = [
  { name: 'YouTube', icon: 'bi-youtube', url: 'https://www.youtube.com/' },
  { name: 'TikTok', icon: 'bi-tiktok', url: 'https://www.tiktok.com/' },
  // { name: 'Instagram', icon: 'bi-instagram', url: 'https://www.instagram.com/' },
  // { name: 'Twitter (X)', icon: 'bi-twitter', url: 'https://x.com/' },
];

const Supported = () => (
  <section className="supported-page">
    <div className="supported-heading">
      <p className="info-eyebrow">Supported Platforms</p>
      <h1>Built for the networks you love</h1>
      <p>More platforms are on the roadmap—tell us which creator hubs to prioritize.</p>
    </div>
    <Container>

        <div className="supported-grid">
          {supportedPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className="platform-card-link"
            >
              <article className="platform-card-large">
                <div className="platform-card-icon">
                  <i className={`bi ${platform.icon}`} />
                </div>
                <h3>{platform.name}</h3>
                <p>Tap to visit {platform.name} now</p>
              </article>
            </a>
          ))}
        </div>
    </Container>
  </section>
);

export default Supported;

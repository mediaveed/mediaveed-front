import React from 'react';
import './home.css';
import { Container } from 'react-bootstrap';

const steps = [
  { title: 'Copy Link', description: 'Grab a video URL from YouTube, TikTok, Instagram, or X.', icon: '🔗' },
  { title: 'Paste Inside MediaVeed', description: 'Drop the link into the input field and hit enter.', icon: '📥' },
  { title: 'We Fetch Everything', description: 'Our engine analyzes the link and readies download options.', icon: '⚙️' },
  { title: 'Choose Audio or Video', description: 'Pick MP3 for pure sound or MP4 for full video.', icon: '🎚️' },
  { title: 'Download & Enjoy', description: 'The file is yours within minutes—ready to play on any device.', icon: '✅' },
];

const HowItWorks = () => (
  <section className="hiw-page">
    <div className="hiw-heading">
      <p className="info-eyebrow">How MediaVeed Works</p>
      <h1>Paste, convert, enjoy.</h1>
      <p>Everything happens inside your browser—no software installs, no logins, no fluff.</p>
    </div>
<Container>

    <div className="hiw-steps">
      {steps.map((step, idx) => (
        <article key={step.title} className="hiw-step">
          <div className="hiw-step__badge">
            <span>{step.icon}</span>
            <small>{idx + 1}</small>
          </div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </article>
      ))}
    </div>
</Container>

    <div className="info-note hiw-note">
      ⚠️ MediaVeed is for personal use only. Respect creator rights when downloading content.
    </div>
  </section>
);

export default HowItWorks;

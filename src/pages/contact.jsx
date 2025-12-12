import React from 'react';
import { Container } from 'react-bootstrap';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import contactContent from '../content/mediaveed/contact/contact.md?raw';
import './home.css';

const supportChannels = [
  { label: 'Email', value: 'support@mediaveed.com', badge: 'Avg. reply 2h' },
  { label: 'Slack Beta Hub', value: '#mediaveed-beta', badge: '24/7 crew' },
  { label: 'Enterprise Hotline', value: '+1 (415) 555-1010', badge: 'Priority' },
];

const responseStats = [
  { value: '92%', label: 'tickets solved same day' },
  { value: '< 15m', label: 'live chat wait time' },
  { value: '5⭐', label: 'creator satisfaction' },
];

const Contact = () => (
  <section className="info-shell">
    <Container>
      <div className="info-shell__header">
        <span className="info-chip">Support</span>
        <h1>Reach the MediaVeed team anytime</h1>
        <p>
          Real humans, real workflows. Send us production notes, billing questions, or roadmap ideas and we’ll loop in the right specialist.
        </p>
      </div>

      <div className="info-shell__grid">
        <div className="info-pane info-pane--stack">
          <div>
            <p className="info-eyebrow">Message us</p>
            <h2 className="info-pane__heading">Creator-first concierge</h2>
            <p className="info-pane__subtext">
              Every submission routes through the highlight operations desk—expect a detailed response plus suggested fixes.
            </p>
          </div>
          <MarkdownRenderer content={contactContent} />
          <div className="info-pane__cta">
            <a href="mailto:support@mediaveed.com">Email Support</a>
            <a href="https://mediaveed.com/slack" target="_blank" rel="noreferrer">
              Join Slack
            </a>
          </div>
        </div>

        <div className="info-pane info-pane--accent">
          <p className="info-eyebrow">Channels</p>
          <h3 className="info-pane__heading">Pick your lane</h3>
          <ul className="info-pane__list">
            {supportChannels.map((channel) => (
              <li key={channel.label}>
                <div>
                  <strong>{channel.label}</strong>
                  <div>{channel.value}</div>
                </div>
                <span className="info-pane__badge">{channel.badge}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="info-pane info-pane--outline">
          <p className="info-eyebrow">Response goals</p>
          <h3 className="info-pane__heading">We publish our SLAs</h3>
          <div className="info-stats">
            {responseStats.map((stat) => (
              <div className="info-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  </section>
);

export default Contact;

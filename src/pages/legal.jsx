import React from 'react';
import { Container, Accordion } from 'react-bootstrap';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import termsContent from '../content/mediaveed/legal/terms.md?raw';
import privacyContent from '../content/mediaveed/legal/privacy.md?raw';
import dmcaContent from '../content/mediaveed/legal/dmca.md?raw';
import disclaimerContent from '../content/mediaveed/legal/disclaimer.md?raw';
import './home.css';

const legalDocs = [
  { key: 'terms', title: 'Terms of Service', body: termsContent },
  { key: 'privacy', title: 'Privacy Policy', body: privacyContent },
  { key: 'dmca', title: 'DMCA Policy', body: dmcaContent },
  { key: 'disclaimer', title: 'Disclaimer', body: disclaimerContent },
];

const complianceHighlights = [
  { label: 'Data Residency', value: 'US + EU clusters' },
  { label: 'Retention', value: '30 days, rolling purge' },
  { label: 'Processor Agreements', value: 'SOC2 vendors only' },
  { label: 'AI Ethics', value: 'Creator-first defaults' },
];

const Legal = () => (
  <section className="info-shell">
    <Container>
      <div className="info-shell__header">
        <span className="info-chip">Legal center</span>
        <h1>Policies that protect every highlight</h1>
        <p>
          Transparent agreements, modern privacy rules, and DMCA automation baked into the platform. Browse the full docs or skim the highlights.
        </p>
      </div>

      <div className="info-shell__grid">
        <div className="info-pane info-pane--accent">
          <p className="info-eyebrow">Compliance highlights</p>
          <div className="legal-grid">
            {complianceHighlights.map((item) => (
              <div className="legal-card" key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="info-pane__cta">
            <a href="mailto:legal@mediaveed.com">Request DPA</a>
            <a href="https://mediaveed.com/security" target="_blank" rel="noreferrer">
              View security posture
            </a>
          </div>
        </div>

        <div className="info-pane info-pane--stack">
          <p className="info-eyebrow">Full documents</p>
          <h2 className="info-pane__heading">Read the fine print</h2>
          <Accordion alwaysOpen className="info-accordion">
            {legalDocs.map((doc, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={doc.key}>
                <Accordion.Header>{doc.title}</Accordion.Header>
                <Accordion.Body>
                  <MarkdownRenderer content={doc.body} />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </div>
    </Container>
  </section>
);

export default Legal;

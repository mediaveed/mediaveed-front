import React from 'react';
import { Container, Accordion } from 'react-bootstrap';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import faqContentRaw from '../content/mediaveed/faq/faq.md?raw';
import './home.css';

const buildFaqItems = (content) => {
  const blocks = content.split(/^##\s+/m).filter(Boolean);
  return blocks.map((block) => {
    const [headingLine, ...rest] = block.trim().split('\n');
    const title = headingLine?.replace(/^#+\s*/, '') || 'Question';
    const body = rest.join('\n').trim();
    return { title, body };
  });
};

const faqItems = buildFaqItems(faqContentRaw);
const spotlight = faqItems.slice(0, 3);

const FAQ = () => (
  <section className="info-shell">
    <Container>
      <div className="info-shell__header">
        <span className="info-chip">FAQ</span>
        <h1>Answers for highlight power users</h1>
        <p>
          Workflow questions, upload limits, billing—everything you’ve asked during beta is organized below. Still stuck? Jump into live chat.
        </p>
      </div>

      <div className="info-shell__grid">
        <div className="info-pane info-pane--stack">
          <div>
            <p className="info-eyebrow">Knowledge base</p>
            <h2 className="info-pane__heading">Searchable answers</h2>
          </div>
          <Accordion alwaysOpen className="info-accordion">
            {faqItems.map((item, index) => (
              <Accordion.Item eventKey={index.toString()} key={`faq-${index}`}>
                <Accordion.Header>{item.title}</Accordion.Header>
                <Accordion.Body>
                  <MarkdownRenderer content={item.body} />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>

        <div className="info-pane info-pane--accent">
          <p className="info-eyebrow">Quick hits</p>
          <h3 className="info-pane__heading">Spotlight responses</h3>
          <ul className="info-pane__list">
            {spotlight.map((item) => (
              <li key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <small className="d-block text-muted">{item.body.slice(0, 110)}...</small>
                </div>
              </li>
            ))}
          </ul>
          <div className="info-pane__cta">
            <a href="mailto:support@mediaveed.com">Email a question</a>
            <a href="https://mediaveed.com/status" target="_blank" rel="noreferrer">
              View platform status
            </a>
          </div>
        </div>
      </div>
    </Container>
  </section>
);

export default FAQ;

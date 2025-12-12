import React from 'react';

const splitIntoBlocks = (content) => {
  if (!content) return [];
  const lines = content.split(/\r?\n/);
  const blocks = [];
  let buffer = [];

  const flush = () => {
    if (!buffer.length) {
      return;
    }
    blocks.push(buffer.join(' ').trim());
    buffer = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      flush();
      blocks.push({ type: 'h4', text: trimmed.replace(/^###\s*/, '') });
      return;
    }
    if (trimmed.startsWith('## ')) {
      flush();
      blocks.push({ type: 'h3', text: trimmed.replace(/^##\s*/, '') });
      return;
    }
    if (trimmed.startsWith('# ')) {
      flush();
      blocks.push({ type: 'h2', text: trimmed.replace(/^#\s*/, '') });
      return;
    }
    if (!trimmed) {
      flush();
      return;
    }
    buffer.push(trimmed);
  });

  flush();
  return blocks;
};

const MarkdownRenderer = ({ content, className = '' }) => {
  const blocks = splitIntoBlocks(content);
  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        if (typeof block === 'string') {
          return <p key={`md-paragraph-${idx}`}>{block}</p>;
        }
        if (block.type === 'h2') {
          return (
            <h2 key={`md-h2-${idx}`} className="md-heading">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={`md-h3-${idx}`} className="md-heading">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'h4') {
          return (
            <h4 key={`md-h4-${idx}`} className="md-heading">
              {block.text}
            </h4>
          );
        }
        return null;
      })}
    </div>
  );
};

export default MarkdownRenderer;

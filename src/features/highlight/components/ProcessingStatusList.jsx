import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_STEPS = [
  {
    id: 'upload',
    title: 'Uploading clip',
    subtitle: 'Secure transfer & checksum verification',
    icon: '📤',
  },
  {
    id: 'transcribe',
    title: 'Transcribing audio',
    subtitle: 'Extracting dialogue to map speech intensity',
    icon: '🎙️',
  },
  {
    id: 'audio',
    title: 'Analyzing audio dynamics',
    subtitle: 'Volume spikes, silence breaks, rhythm',
    icon: '🔊',
  },
  {
    id: 'vision',
    title: 'Analyzing video frames',
    subtitle: 'Scene changes, motion, color bursts',
    icon: '🎬',
  },
  {
    id: 'scoring',
    title: 'Scoring highlight candidates',
    subtitle: 'Blending audio, motion, and dialogue cues',
    icon: '⚡',
  },
  {
    id: 'segmenting',
    title: 'Building highlight segments',
    subtitle: 'Ranking and trimming the best clips',
    icon: '✂️',
  },
  {
    id: 'summary',
    title: 'Finalizing timeline',
    subtitle: 'Packaging analysis for review',
    icon: '📈',
  },
];

const STEP_INTERVAL_MS = 1200;

const ProcessingStatusList = ({ processing, statusMessage, steps = DEFAULT_STEPS }) => {
  const [activeIndex, setActiveIndex] = useState(processing ? 0 : steps.length - 1);

  useEffect(() => {
    if (!processing) {
      setActiveIndex(steps.length - 1);
      return undefined;
    }

    setActiveIndex(0);
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [processing, steps.length]);

  return (
    <div className="processing-status-wrapper">
      {statusMessage && <p className="processing-status-lead">{statusMessage}</p>}
      <ul className="processing-status-list" aria-live="polite">
        {steps.map((step, index) => {
          const state =
            index < activeIndex ? 'complete' : index === activeIndex && processing ? 'active' : 'pending';
          return (
            <li key={step.id} className={`processing-step ${state}`}>
              <div className="step-node" aria-hidden="true">
                {step.icon}
              </div>
              <div className="step-copy">
                <p className="step-title mb-1">{step.title}</p>
                <p className="step-subtitle mb-0">{step.subtitle}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

ProcessingStatusList.propTypes = {
  processing: PropTypes.bool,
  statusMessage: PropTypes.string,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ),
};

ProcessingStatusList.defaultProps = {
  processing: false,
  statusMessage: '',
  steps: DEFAULT_STEPS,
};

export default ProcessingStatusList;

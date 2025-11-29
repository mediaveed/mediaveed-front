import React from 'react';

const icons = {
  success: 'bi-check-circle-fill',
  processing: 'bi-arrow-repeat',
  error: 'bi-exclamation-octagon-fill',
  info: 'bi-info-circle-fill',
};

const HighlightStatusCard = ({
  variant = 'info',
  title,
  message,
  hint,
  supportText = 'Need help? Contact support@mediaveed.com',
}) => {
  const iconClass = icons[variant] || icons.info;

  return (
    <div className={`highlight-status-card highlight-status-card--${variant}`}>
      <div className="highlight-status-card__icon">
        <i className={`bi ${iconClass}`} aria-hidden="true" />
      </div>
      <div>
        {title && <p className="highlight-status-card__title">{title}</p>}
        {message && <p className="highlight-status-card__message">{message}</p>}
        {hint && <p className="highlight-status-card__hint">{hint}</p>}
        {variant === 'error' && supportText && (
          <p className="highlight-status-card__support">{supportText}</p>
        )}
      </div>
    </div>
  );
};

export default HighlightStatusCard;

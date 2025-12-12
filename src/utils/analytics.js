import { readAuthToken as readTokenHelper } from './token.js';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const AUTH_STORAGE_KEY = 'mediaveed_jwt';

let initialized = false;
let authWatcherStarted = false;
let lastAuthToken = null;
let authPollTimer = null;

const isBrowser = typeof window !== 'undefined';

const insertAnalyticsScript = () => {
  if (!isBrowser || !MEASUREMENT_ID) return;
  const existing = document.querySelector(`script[data-gtag="${MEASUREMENT_ID}"]`);
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.dataset.gtag = MEASUREMENT_ID;
  document.head.appendChild(script);
};

export const initAnalytics = () => {
  if (!isBrowser || !MEASUREMENT_ID || initialized) {
    return;
  }

  insertAnalyticsScript();

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
  initialized = true;
};

const ensureInit = () => {
  if (!initialized) {
    initAnalytics();
  }
  return initialized && typeof window.gtag === 'function';
};

export const trackEvent = (eventName, params = {}) => {
  if (!isBrowser || !MEASUREMENT_ID || !eventName) return;
  if (!ensureInit()) return;
  window.gtag('event', eventName, {
    send_to: MEASUREMENT_ID,
    ...params,
  });
};

export const trackPageView = (pagePath, pageTitle) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: isBrowser ? window.location.href : undefined,
  });
};

export const trackNavigation = (destination, context = {}) => {
  trackEvent('navigation_click', {
    destination,
    ...context,
  });
};

export const trackButtonClick = (buttonId, context = {}) => {
  trackEvent('button_click', {
    button_id: buttonId,
    ...context,
  });
};

export const trackDownloaderEvent = (phase, context = {}) => {
  trackEvent('downloader_event', {
    phase,
    ...context,
  });
};

export const trackUploadEvent = (phase, context = {}) => {
  trackEvent('highlight_upload', {
    phase,
    ...context,
  });
};

export const trackHighlightGeneration = (phase, context = {}) => {
  trackEvent('highlight_generation', {
    phase,
    ...context,
  });
};

export const trackEditingEvent = (action, context = {}) => {
  trackEvent('highlight_editing', {
    action,
    ...context,
  });
};

export const trackExportEvent = (format, context = {}) => {
  trackEvent('export_action', {
    format,
    ...context,
  });
};

export const trackAuthEvent = (action, context = {}) => {
  trackEvent('auth_event', {
    action,
    ...context,
  });
};

const readAuthToken = () => {
  if (!isBrowser) return null;
  return readTokenHelper() || null;
};

const handleAuthChange = (nextToken) => {
  if (nextToken && !lastAuthToken) {
    trackAuthEvent('login', { method: 'jwt' });
  } else if (!nextToken && lastAuthToken) {
    trackAuthEvent('logout', { method: 'jwt' });
  } else if (nextToken && lastAuthToken && nextToken !== lastAuthToken) {
    trackAuthEvent('token_refreshed', { method: 'jwt' });
  }
  lastAuthToken = nextToken;
};

const handleStorageEvent = (event) => {
  if (event.key !== AUTH_STORAGE_KEY) return;
  handleAuthChange(event.newValue);
};

export const startAuthWatcher = () => {
  if (!isBrowser || authWatcherStarted) return;
  authWatcherStarted = true;
  lastAuthToken = readAuthToken();
  if (lastAuthToken) {
    trackAuthEvent('session_restored', { method: 'jwt' });
  }

  window.addEventListener('storage', handleStorageEvent);
  authPollTimer = window.setInterval(() => {
    const token = readAuthToken();
    if (token !== lastAuthToken) {
      handleAuthChange(token);
    }
  }, 5000);
};

export const stopAuthWatcher = () => {
  if (!isBrowser || !authWatcherStarted) return;
  window.removeEventListener('storage', handleStorageEvent);
  if (authPollTimer) {
    window.clearInterval(authPollTimer);
    authPollTimer = null;
  }
  authWatcherStarted = false;
};

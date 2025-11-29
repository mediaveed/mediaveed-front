const API_BASE_URL =
  import.meta.env.VITE_HIGHLIGHT_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8006';

const API_PREFIX = import.meta.env.VITE_HIGHLIGHT_API_PREFIX || '/api/v1/highlight';

const API_KEY =
  import.meta.env.VITE_HIGHLIGHT_API_KEY ||
  import.meta.env.VITE_MEDIAVEED_INTERNAL_API_KEY ||
  import.meta.env.VITE_API_KEY ||
  '';

const MAX_UPLOAD_MB = Number(
  import.meta.env.VITE_HIGHLIGHT_MAX_UPLOAD_MB ||
    import.meta.env.VITE_MEDIAVEED_MAX_UPLOAD_MB ||
    import.meta.env.VITE_MAX_UPLOAD_MB ||
    300
);

export { API_BASE_URL, API_PREFIX, API_KEY, MAX_UPLOAD_MB };

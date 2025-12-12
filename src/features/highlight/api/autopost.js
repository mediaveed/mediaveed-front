import { API_BASE_URL, API_KEY } from '../config/api';
import { getAuthHeaders, buildApiUrl } from '../hooks/useHighlightEngine';

const parseError = async (response) => {
  try {
    const payload = await response.json();
    const detail = payload?.detail ?? payload;
    if (typeof detail === 'string') return detail;
    if (detail?.error) return detail.error;
    if (detail?.message) return detail.message;
  } catch {
    /* ignore */
  }
  return 'Unable to complete request.';
};

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
  ...getAuthHeaders(),
});

export const requestAutoPost = async (payload) => {
  const response = await fetch(buildApiUrl('/api/v1/autopost/request'), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
};

export const fetchAutoPostJobs = async () => {
  const response = await fetch(buildApiUrl('/api/v1/autopost/jobs'), {
    headers: buildHeaders(),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
};

export const fetchAutoPostStatus = async () => {
  const response = await fetch(buildApiUrl('/api/v1/autopost/status'), {
    headers: buildHeaders(),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
};

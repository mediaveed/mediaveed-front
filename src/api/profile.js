import { API_BASE_URL, API_KEY } from '../features/highlight/config/api';
import { readAuthToken } from '../utils/token.js';

const authHeaders = () => {
  const stored = readAuthToken();
  return stored ? { Authorization: `Bearer ${stored}` } : {};
};

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
  return 'Unable to load profile.';
};

const buildHeaders = () => ({
  'Content-Type': 'application/json',
  ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
  ...authHeaders(),
});

export const fetchProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
    headers: buildHeaders(),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
};

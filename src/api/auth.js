import { API_BASE_URL } from '../features/highlight/config/api';

const BASE_URL = `${API_BASE_URL}/api/v1/auth`;

const parseError = async (response) => {
  try {
    const payload = await response.json();
    const detail = payload?.detail ?? payload;
    if (typeof detail === 'string') return detail;
    if (detail?.error) return detail.error;
    if (detail?.message) return detail.message;
  } catch {
    /* swallow parse errors */
  }
  return 'Unable to complete request.';
};

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
};

export const signup = async (payload) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const login = async (payload) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

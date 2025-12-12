const AUTH_KEY = 'mediaveed_jwt';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 48;
const REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const readCookieToken = () => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
};

export const readAuthToken = () => {
  if (typeof window === 'undefined') return '';
  try {
    const stored =
      window.localStorage.getItem(AUTH_KEY) ||
      window.sessionStorage.getItem(AUTH_KEY);
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  const cookieValue = readCookieToken();
  if (cookieValue) {
    try {
      window.localStorage.setItem(AUTH_KEY, cookieValue);
    } catch {
      /* ignore */
    }
  }
  return cookieValue;
};

export const persistAuthToken = (token, remember = false) => {
  if (typeof window === 'undefined' || !token) return;
  try {
    window.localStorage.setItem(AUTH_KEY, token);
    window.sessionStorage.setItem(AUTH_KEY, token);
  } catch {
    /* ignore */
  }
  try {
    const maxAge = remember ? REMEMBER_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS;
    document.cookie = `${AUTH_KEY}=${encodeURIComponent(
      token
    )}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
};

export const clearAuthToken = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTH_KEY);
    window.sessionStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${AUTH_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* ignore */
  }
};

// src/config/api.js

// Base backend API URL (you can override via .env)
export const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8005";

export const endpoints = {
    tiktok: `${BASE_URL}/api/v1/tiktok`,
    youtube: `${BASE_URL}/api/v1/youtube`,
    instagram: `${BASE_URL}/api/v1/instagram`,
    twitter: `${BASE_URL}/api/v1/twitter`,
};

// src/utils/api.js
// THIS VERSION WORKS 100% EVERYWHERE — LOCAL AND LIVE

// Hard-code for local development
let API_BASE = 'http://localhost:5000/api';

// ONLY on Vercel production — override with the live backend
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  API_BASE = 'https://ableconnect-backend.onrender.com/api';
}

// Optional: allow manual override via env (just in case)
if (import.meta.env?.VITE_API_URL) {
  API_BASE = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
}

const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const config = {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  };

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const msg = typeof data === 'object' && data?.message ? data.message : data || response.statusText;
    throw new Error(msg);
  }

  return data || {};
};

export default apiFetch;
// src/utils/api.js
// FINAL VERSION — 100% working for JSON + PDFs + Images + Downloads

let API_BASE = 'http://localhost:5000/api';

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  API_BASE = 'https://ableconnect-backend.onrender.com/api';
}

if (import.meta.env?.VITE_API_URL) {
  API_BASE = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
}

const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      // Don't set Content-Type for FormData
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // THIS IS THE KEY FIX — check if we expect a file
  const isFileRequest = options.responseType === 'blob' || endpoint.includes('?view=true');

  if (isFileRequest) {
    // Return raw blob — DO NOT parse as JSON!
    const blob = await response.blob();
    if (!response.ok) {
      throw new Error('Failed to load file');
    }
    return blob;
  }

  // Only for JSON APIs
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(text || 'Server error');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Request failed');
  }

  return data;
};

export default apiFetch;
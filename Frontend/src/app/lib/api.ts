const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function apiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const API_BASE = API_BASE_URL;

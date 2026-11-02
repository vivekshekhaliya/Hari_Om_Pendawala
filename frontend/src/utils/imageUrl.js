/**
 * Utility to resolve image URLs properly across environments.
 * Uploaded files in /uploads/ are served by the backend (port 5001),
 * while bundled static assets are served from /assets/.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5001').replace(/\/+$/, '');

export function getImageUrl(path, fallback = '/assets/thabdi-penda.jpg') {
  if (!path) return fallback;

  // If already absolute URL, blob preview, or data URL
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  // Uploaded files from backend
  if (path.startsWith('/uploads/')) {
    return `${BACKEND_URL}${path}`;
  }
  if (path.startsWith('uploads/')) {
    return `${BACKEND_URL}/${path}`;
  }

  // Public assets
  return path;
}

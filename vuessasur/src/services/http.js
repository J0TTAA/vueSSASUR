// Pequeño wrapper sobre fetch para unificar baseURL, cabeceras y manejo de errores

const DEFAULT_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8002/api';

function buildUrl(path, query) {
  const base = DEFAULT_BASE_URL.replace(/\/$/, '');
  const cleanPath = String(path || '').replace(/^\//, '');
  const url = new URL(`${base}/${cleanPath}`);
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function request(method, path, { query, body, headers } = {}) {
  const url = buildUrl(path, query);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const finalHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...(headers || {})
  };

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body)
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json().catch(() => ({})) : await response.text();

  if (!response.ok) {
    const message = isJson && data && (data.message || data.error) ? (data.message || data.error) : `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const http = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, opts) => request('POST', path, opts),
  put: (path, opts) => request('PUT', path, opts),
  patch: (path, opts) => request('PATCH', path, opts),
  delete: (path, opts) => request('DELETE', path, opts)
};

export function unwrapArrayPayload(payload) {
  // Acepta: [ ... ] | { data: [...] } | { success, data: [...] }
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  // Laravel paginator { data: [...], ... }
  return [];
}

export function unwrapItemPayload(payload) {
  // Acepta: { ... } | { data: { ... } }
  if (payload && payload.data && typeof payload.data === 'object') return payload.data;
  return payload;
}

export function normalizeText(value) {
  return value
    ? String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim()
    : '';
}



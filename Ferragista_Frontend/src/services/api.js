const defaultApiUrl = import.meta.env.DEV ? 'http://localhost:8080/api' : `${window.location.origin}/api`;
const API_BASE_URL = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const { auth = true, headers = {}, body, ...fetchOptions } = options;
  const requestHeaders = { Accept: 'application/json', ...headers };
  const token = localStorage.getItem('cafecomleite.token');

  if (auth && token) requestHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData)) requestHeaders['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: requestHeaders,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload.message || payload.erro || payload.error || payload.detail || 'Não foi possível concluir a operação.';
    throw new Error(message);
  }

  return payload;
}

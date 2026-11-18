import { apiRequest } from './api.js';

export const login = (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials, auth: false });
export const currentUser = () => apiRequest('/auth/me');
export const logout = () => apiRequest('/auth/logout', { method: 'POST' });

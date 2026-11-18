import { apiRequest } from './api.js';

export const listarClientes = (busca = '') => apiRequest(`/clientes${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`);
export const criarCliente = (cliente) => apiRequest('/clientes', { method: 'POST', body: cliente });
export const atualizarCliente = (id, cliente) => apiRequest(`/clientes/${id}`, { method: 'PUT', body: cliente });
export const excluirCliente = (id) => apiRequest(`/clientes/${id}`, { method: 'DELETE' });

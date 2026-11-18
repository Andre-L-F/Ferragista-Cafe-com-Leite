import { apiRequest } from './api.js';

export const listarProdutos = (busca = '') => apiRequest(`/produtos${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`);
export const criarProduto = (produto) => apiRequest('/produtos', { method: 'POST', body: produto });
export const atualizarProduto = (id, produto) => apiRequest(`/produtos/${id}`, { method: 'PUT', body: produto });
export const excluirProduto = (id) => apiRequest(`/produtos/${id}`, { method: 'DELETE' });

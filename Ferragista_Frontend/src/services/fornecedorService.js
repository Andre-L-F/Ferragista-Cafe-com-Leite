import { apiRequest } from './api.js';

export const listarFornecedores = (busca = '') => apiRequest(`/fornecedores${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`);
export const criarFornecedor = (fornecedor) => apiRequest('/fornecedores', { method: 'POST', body: fornecedor });
export const atualizarFornecedor = (id, fornecedor) => apiRequest(`/fornecedores/${id}`, { method: 'PUT', body: fornecedor });
export const excluirFornecedor = (id) => apiRequest(`/fornecedores/${id}`, { method: 'DELETE' });

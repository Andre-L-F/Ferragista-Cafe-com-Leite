import { apiRequest } from './api.js';

export const listarVendas = () => apiRequest('/vendas');
export const buscarVenda = (id) => apiRequest(`/vendas/${id}`);
export const registrarVenda = (venda) => apiRequest('/vendas', { method: 'POST', body: venda });
export const cancelarVenda = (id) => apiRequest(`/vendas/${id}/cancelar`, { method: 'PATCH' });

import { apiRequest } from './api.js';

export const listarUsuarios = () => apiRequest('/usuarios');
export const criarUsuario = (usuario) => apiRequest('/usuarios', { method: 'POST', body: usuario });
export const atualizarUsuario = (id, usuario) => apiRequest(`/usuarios/${id}`, { method: 'PUT', body: usuario });
export const excluirUsuario = (id) => apiRequest(`/usuarios/${id}`, { method: 'DELETE' });

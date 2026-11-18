import { Outlet, useLocation } from 'react-router-dom';
import { Bell, CircleHelp } from 'lucide-react';
import AppSidebar from './AppSidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const titleByPath = {
  '/pdv': ['Ponto de venda', 'Atendimento e finalização de vendas'],
  '/produtos': ['Produtos', 'Catálogo e controle de estoque'],
  '/fornecedores': ['Fornecedores', 'Parceiros e distribuidores'],
  '/clientes': ['Clientes', 'Cadastro e informações de clientes'],
  '/vendas': ['Vendas', 'Histórico e acompanhamento de vendas'],
  '/usuarios': ['Usuários', 'Acesso e equipe da ferragista'],
};

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [title, subtitle] = titleByPath[location.pathname] || titleByPath['/pdv'];
  const initials = (user?.nome || 'Operador').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-context"><span className="topbar-eyebrow">CAFÉ COM LEITE / SISTEMA DE VENDAS</span><span className="topbar-title">{title}</span></div>
          <div className="topbar-actions">
            <span className="store-status"><span /> Caixa conectado</span>
            <button type="button" className="topbar-icon" aria-label="Ajuda"><CircleHelp size={18} /></button>
            <button type="button" className="topbar-icon" aria-label="Notificações"><Bell size={18} /></button>
            <div className="user-summary">
              <div className="user-avatar">{initials}</div>
              <div className="user-meta"><strong id="navUserName">{user?.nome || 'Operador'}</strong><span id="navUserRole">{user?.perfil || 'VENDEDOR'}</span></div>
            </div>
          </div>
        </header>
        <main className="page-content"><div className="page-subtitle">{subtitle}</div><Outlet /></main>
      </div>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Truck, Users, Receipt, ShieldCheck, LogOut, PanelLeftClose } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const menu = [
  { to: '/pdv', label: 'Ponto de venda', icon: ShoppingCart },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/vendas', label: 'Vendas', icon: Receipt },
  { to: '/usuarios', label: 'Usuários', icon: ShieldCheck },
];

export default function AppSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    window.location.href = '/login.html';
  }

  return (
    <aside className="app-sidebar">
      <div className="brand-block">
        <div className="brand-logo"><img src="/logo-cafe-com-leite.png" alt="Logo Café com Leite" /></div>
        <div className="brand-copy"><strong>Café com Leite</strong><span>Ferragista</span></div>
      </div>
      <div className="sidebar-section-label">OPERAÇÃO</div>
      <nav className="sidebar-nav" aria-label="Menu principal">
        {menu.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-help"><span className="help-dot" /><span>Operação do caixa</span></div>
        <button type="button" className="sidebar-link logout-link" onClick={handleLogout}>
          <LogOut size={19} strokeWidth={1.8} /><span>Sair do sistema</span>
        </button>
      </div>
    </aside>
  );
}

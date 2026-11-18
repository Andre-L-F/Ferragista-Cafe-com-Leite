import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AppLayout from './layout/AppLayout.jsx';
import PdvPage from './pages/PdvPage.jsx';
import ProdutosPage from './pages/ProdutosPage.jsx';
import FornecedoresPage from './pages/FornecedoresPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import VendasPage from './pages/VendasPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';

function ApplicationRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/pdv" replace />} />
          <Route path="pdv" element={<PdvPage />} />
          <Route path="produtos" element={<ProdutosPage />} />
          <Route path="fornecedores" element={<FornecedoresPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="vendas" element={<VendasPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="*" element={<Navigate to="/pdv" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const entryPath = window.location.pathname;
  const isLoginEntry = entryPath === '/login.html' || entryPath === '/';

  useEffect(() => {
    if (loading) return;
    if (!isLoginEntry && !user) window.location.replace('/login.html');
  }, [isLoginEntry, loading, user]);

  if (isLoginEntry) return <LoginPage />;
  if (loading) return <div className="app-loading"><span className="loader" />Validando sessão...</div>;
  if (!user) return <LoginPage />;
  return <ApplicationRoutes />;
}

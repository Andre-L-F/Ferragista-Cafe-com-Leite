import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cafecomleite.user') || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('cafecomleite.token')));

  useEffect(() => {
    if (!localStorage.getItem('cafecomleite.token')) {
      setLoading(false);
      return;
    }

    authService.currentUser()
      .then((data) => {
        setUser(data);
        localStorage.setItem('cafecomleite.user', JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem('cafecomleite.token');
        localStorage.removeItem('cafecomleite.user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signIn(login, senha) {
    const data = await authService.login({ login, senha });
    localStorage.setItem('cafecomleite.token', data.token);
    const authenticatedUser = {
      id: data.id,
      nome: data.nome,
      username: data.username,
      email: data.email,
      perfil: data.perfil,
    };
    localStorage.setItem('cafecomleite.user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    return authenticatedUser;
  }

  async function signOut() {
    try { if (localStorage.getItem('cafecomleite.token')) await authService.logout(); }
    catch { /* A sessão local será encerrada mesmo se a API estiver indisponível. */ }
    localStorage.removeItem('cafecomleite.token');
    localStorage.removeItem('cafecomleite.user');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  return context;
}

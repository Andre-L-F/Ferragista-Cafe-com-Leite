// Utilitário de autenticação para o frontend
const Auth = {
  TOKEN_KEY: 'ferragista_auth_token',
  USER_KEY: 'ferragista_user_data',

  salvarSessao(data) {
    if (data.token) {
      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify({
        id: data.id,
        nome: data.nome,
        username: data.username,
        email: data.email,
        perfil: data.perfil
      }));
    }
  },

  obterToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  obterUsuario() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  estaAutenticado() {
    return !!this.obterToken();
  },

  logout() {
    const token = this.obterToken();
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      }).catch(() => {});
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/login.html';
  },

  exigirAutenticacao() {
    if (!this.estaAutenticado()) {
      window.location.href = '/login.html';
    }
  },

  headersComAuth() {
    const token = this.obterToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  }
};

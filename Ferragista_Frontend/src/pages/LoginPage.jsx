import { useState } from 'react';
import { Hammer, LockKeyhole, UserRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(login.trim(), senha);
      window.location.href = '/index.html#/pdv';
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível entrar. Verifique seus dados.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-art-panel">
        <div className="login-art-brand"><div className="login-mark"><Hammer size={28} /></div><span>Café com Leite <small>FERRAGISTA</small></span></div>
        <div className="login-art-copy"><span className="eyebrow">GESTÃO QUE CONSTRÓI</span><h1>Seu trabalho.<br /><em>Mais simples.</em></h1><p>Uma operação mais organizada para cuidar de cada venda, produto e cliente.</p></div>
        <div className="login-art-footer"><ShieldCheck size={17} /> Acesso seguro ao sistema de vendas</div>
      </section>
      <section className="login-form-panel">
        <div className="login-form-box">
          <img className="login-logo" src="/logo-cafe-com-leite.png" alt="Café com Leite" />
          <span className="eyebrow text-gold">BEM-VINDO DE VOLTA</span>
          <h2>Acesse sua conta</h2>
          <p className="login-description">Entre com seu usuário e senha para acessar o caixa.</p>
          <form id="loginForm" onSubmit={handleSubmit} className="login-form">
            <label className="form-field field-full" htmlFor="username">Usuário ou e-mail
              <span className="input-with-icon"><UserRound size={18} /><input id="username" name="login" value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" required placeholder="Digite seu usuário ou e-mail" /></span>
            </label>
            <label className="form-field field-full" htmlFor="password">Senha
              <span className="input-with-icon"><LockKeyhole size={18} /><input id="password" name="senha" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete="current-password" required placeholder="Digite sua senha" /></span>
            </label>
            {error && <div id="loginAlert" className="login-alert" role="alert">{error}</div>}
            {!error && <div id="loginAlert" className="login-alert login-alert-empty" role="alert" />}
            <button id="btnLogin" className="button button-primary button-login" type="submit" disabled={submitting}>
              {submitting ? 'Validando acesso...' : <>Entrar no sistema <ArrowRight size={18} /></>}
            </button>
          </form>
          <div className="login-footnote">Acesso restrito a colaboradores autorizados.</div>
        </div>
      </section>
    </main>
  );
}

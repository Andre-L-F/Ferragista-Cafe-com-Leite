import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, UserRound } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/Field.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { criarUsuario, atualizarUsuario, excluirUsuario, listarUsuarios } from '../services/usuarioService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const blank = { nome: '', email: '', username: '', senha: '', perfil: 'VENDEDOR', ativo: true };

export default function UsuariosPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  async function load() { setLoading(true); try { setList(await listarUsuarios()); } catch (error) { toast.error(error.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const rows = list.filter((item) => `${item.nome} ${item.email} ${item.username}`.toLowerCase().includes(query.toLowerCase()));
  function edit(item) { setEditing(item); setForm(item ? { ...blank, ...item, senha: '' } : blank); setOpen(true); }
  function change(event) { const { name, value, type, checked } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    const data = { nome: form.nome, email: form.email, username: form.username, perfil: form.perfil, ativo: Boolean(form.ativo) };
    if (form.senha) data.senha = form.senha;
    try { if (editing) { await atualizarUsuario(editing.id, data); toast.success('Usuário atualizado com sucesso.'); } else { await criarUsuario(data); toast.success('Usuário cadastrado com sucesso.'); } setOpen(false); await load(); }
    catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }
  async function remove(item) { if (item.id === user?.id) { toast.error('Você não pode excluir o usuário conectado.'); return; } if (!window.confirm(`Excluir o usuário ${item.nome}?`)) return; try { await excluirUsuario(item.id); toast.success('Usuário excluído com sucesso.'); await load(); } catch (error) { toast.error(error.message); } }

  return <>
    <PageHeader title="Usuários" subtitle="Gerencie os acessos da equipe ao sistema." actions={<button className="button button-primary" type="button" onClick={() => edit(null)}><Plus size={17} /> Novo usuário</button>} />
    <div className="toolbar"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, usuário ou e-mail..." /></div>
    {loading ? <LoadingState /> : <DataTable columns={['Usuário', 'Login', 'Perfil', 'Situação', 'Ações']}>
      {rows.map((item) => <tr key={item.id}><td><div className="table-product"><div className="table-product-icon"><UserRound size={18} /></div><div><strong>{item.nome}</strong><span>{item.email}</span></div></div></td><td>{item.username}</td><td><span className="role-label"><ShieldCheck size={14} />{item.perfil}</span></td><td>{item.ativo ? <StatusBadge tone="success">Ativo</StatusBadge> : <StatusBadge tone="danger">Inativo</StatusBadge>}</td><td><div className="table-actions"><button className="icon-button" type="button" aria-label="Editar usuário" onClick={() => edit(item)}><Pencil size={16} /></button><button className="icon-button danger" type="button" aria-label="Excluir usuário" onClick={() => remove(item)}><Trash2 size={16} /></button></div></td></tr>)}
    </DataTable>}
    <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar usuário' : 'Novo usuário'}>
      <form className="form-grid" onSubmit={save}>
        <Field id="usuarioNome" label="Nome completo" required full><input id="usuarioNome" name="nome" value={form.nome} onChange={change} required /></Field>
        <Field id="usuarioEmail" label="E-mail" required full><input id="usuarioEmail" name="email" type="email" value={form.email} onChange={change} required /></Field>
        <Field id="usuarioLogin" label="Nome de usuário" required full><input id="usuarioLogin" name="username" value={form.username} onChange={change} required /></Field>
        <Field id="usuarioSenha" label={editing ? 'Nova senha (opcional)' : 'Senha'} required={!editing} full><input id="usuarioSenha" name="senha" type="password" value={form.senha} onChange={change} required={!editing} /></Field>
        <Field id="usuarioPerfil" label="Perfil" required full><select id="usuarioPerfil" name="perfil" value={form.perfil} onChange={change}><option value="ADMIN">Administrador</option><option value="VENDEDOR">Vendedor</option></select></Field>
        <label className="checkbox-field field-full"><input name="ativo" type="checkbox" checked={Boolean(form.ativo)} onChange={change} /> Usuário ativo</label>
        <div className="form-actions field-full"><button className="button button-secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar usuário'}</button></div>
      </form>
    </Modal>
  </>;
}

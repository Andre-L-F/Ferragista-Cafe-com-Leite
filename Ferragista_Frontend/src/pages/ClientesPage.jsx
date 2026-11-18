import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, UserRound } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/Field.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { criarCliente, atualizarCliente, excluirCliente, listarClientes } from '../services/clienteService.js';
import { useToast } from '../context/ToastContext.jsx';

const blank = { nome: '', cpf: '', telefone: '', email: '', endereco: '', cidade: '' };

export default function ClientesPage() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  async function load() { setLoading(true); try { setList(await listarClientes()); } catch (error) { toast.error(error.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const rows = list.filter((item) => `${item.nome} ${item.cpf} ${item.telefone}`.toLowerCase().includes(query.toLowerCase()));
  function edit(item) { setEditing(item); setForm(item ? { ...blank, ...item } : blank); setOpen(true); }
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    const data = { ...form, email: form.email || null, endereco: form.endereco || null, cidade: form.cidade || null };
    try { if (editing) { await atualizarCliente(editing.id, data); toast.success('Cliente atualizado com sucesso.'); } else { await criarCliente(data); toast.success('Cliente cadastrado com sucesso.'); } setOpen(false); await load(); }
    catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }
  async function remove(item) { if (!window.confirm(`Excluir o cliente ${item.nome}?`)) return; try { await excluirCliente(item.id); toast.success('Cliente excluído com sucesso.'); await load(); } catch (error) { toast.error(error.message); } }

  return <>
    <PageHeader title="Clientes" subtitle={`${list.length} clientes cadastrados.`} actions={<button className="button button-primary" type="button" onClick={() => edit(null)}><Plus size={17} /> Novo cliente</button>} />
    <div className="toolbar"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, CPF ou telefone..." /></div>
    {loading ? <LoadingState /> : <DataTable columns={['Cliente', 'CPF', 'Telefone', 'E-mail', 'Cidade', 'Ações']}>
      {rows.map((item) => <tr key={item.id}><td><div className="table-product"><div className="table-product-icon"><UserRound size={18} /></div><div><strong>{item.nome}</strong><span>Cliente #{item.id}</span></div></div></td><td>{item.cpf}</td><td>{item.telefone}</td><td>{item.email || '—'}</td><td>{item.cidade || '—'}</td><td><div className="table-actions"><button className="icon-button" type="button" aria-label="Editar cliente" onClick={() => edit(item)}><Pencil size={16} /></button><button className="icon-button danger" type="button" aria-label="Excluir cliente" onClick={() => remove(item)}><Trash2 size={16} /></button></div></td></tr>)}
    </DataTable>}
    <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'} wide>
      <form className="form-grid" onSubmit={save}>
        <Field id="clienteNome" label="Nome completo" required full><input id="clienteNome" name="nome" value={form.nome} onChange={change} required /></Field>
        <Field id="clienteCpf" label="CPF" required><input id="clienteCpf" name="cpf" value={form.cpf} onChange={change} required /></Field>
        <Field id="clienteTelefone" label="Telefone" required><input id="clienteTelefone" name="telefone" value={form.telefone} onChange={change} required /></Field>
        <Field id="clienteEmail" label="E-mail"><input id="clienteEmail" name="email" type="email" value={form.email || ''} onChange={change} /></Field>
        <Field id="clienteCidade" label="Cidade"><input id="clienteCidade" name="cidade" value={form.cidade || ''} onChange={change} /></Field>
        <Field id="clienteEndereco" label="Endereço" full><input id="clienteEndereco" name="endereco" value={form.endereco || ''} onChange={change} /></Field>
        <div className="form-actions field-full"><button className="button button-secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar cliente'}</button></div>
      </form>
    </Modal>
  </>;
}

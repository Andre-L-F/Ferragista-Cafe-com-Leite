import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/Field.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { criarFornecedor, atualizarFornecedor, excluirFornecedor, listarFornecedores } from '../services/fornecedorService.js';
import { useToast } from '../context/ToastContext.jsx';

const blank = { razaoSocial: '', nomeFantasia: '', cnpj: '', telefone: '', email: '', cidade: '', estado: '' };

export default function FornecedoresPage() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  async function load() { setLoading(true); try { setList(await listarFornecedores()); } catch (error) { toast.error(error.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const rows = list.filter((item) => `${item.nomeFantasia} ${item.razaoSocial} ${item.cnpj}`.toLowerCase().includes(query.toLowerCase()));
  function edit(item) { setEditing(item); setForm(item ? { ...blank, ...item } : blank); setOpen(true); }
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    try {
      const data = { ...form, estado: form.estado.toUpperCase() };
      if (editing) { await atualizarFornecedor(editing.id, data); toast.success('Fornecedor atualizado com sucesso.'); }
      else { await criarFornecedor(data); toast.success('Fornecedor cadastrado com sucesso.'); }
      setOpen(false); await load();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }
  async function remove(item) { if (!window.confirm(`Excluir o fornecedor ${item.nomeFantasia}?`)) return; try { await excluirFornecedor(item.id); toast.success('Fornecedor excluído com sucesso.'); await load(); } catch (error) { toast.error(error.message); } }

  return <>
    <PageHeader title="Fornecedores" subtitle={`${list.length} parceiros cadastrados.`} actions={<button className="button button-primary" type="button" onClick={() => edit(null)}><Plus size={17} /> Novo fornecedor</button>} />
    <div className="toolbar"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, razão social ou CNPJ..." /></div>
    {loading ? <LoadingState /> : <DataTable columns={['Fornecedor', 'CNPJ', 'Contato', 'Localização', 'Ações']}>
      {rows.map((item) => <tr key={item.id}><td><div className="table-product"><div className="table-product-icon"><Truck size={18} /></div><div><strong>{item.nomeFantasia}</strong><span>{item.razaoSocial}</span></div></div></td><td>{item.cnpj}</td><td><strong>{item.telefone}</strong><span className="table-secondary">{item.email || 'Sem e-mail'}</span></td><td>{item.cidade} / {item.estado}</td><td><div className="table-actions"><button className="icon-button" type="button" aria-label="Editar fornecedor" onClick={() => edit(item)}><Pencil size={16} /></button><button className="icon-button danger" type="button" aria-label="Excluir fornecedor" onClick={() => remove(item)}><Trash2 size={16} /></button></div></td></tr>)}
    </DataTable>}
    <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar fornecedor' : 'Novo fornecedor'} wide>
      <form className="form-grid" onSubmit={save}>
        <Field id="fornRazao" label="Razão social" required full><input id="fornRazao" name="razaoSocial" value={form.razaoSocial} onChange={change} required /></Field>
        <Field id="fornFantasia" label="Nome fantasia" required><input id="fornFantasia" name="nomeFantasia" value={form.nomeFantasia} onChange={change} required /></Field>
        <Field id="fornCnpj" label="CNPJ" required><input id="fornCnpj" name="cnpj" value={form.cnpj} onChange={change} required /></Field>
        <Field id="fornTelefone" label="Telefone" required><input id="fornTelefone" name="telefone" value={form.telefone} onChange={change} required /></Field>
        <Field id="fornEmail" label="E-mail"><input id="fornEmail" name="email" type="email" value={form.email || ''} onChange={change} /></Field>
        <Field id="fornCidade" label="Cidade" required><input id="fornCidade" name="cidade" value={form.cidade} onChange={change} required /></Field>
        <Field id="fornEstado" label="UF" required><input id="fornEstado" name="estado" value={form.estado} onChange={change} required minLength="2" maxLength="2" /></Field>
        <div className="form-actions field-full"><button className="button button-secondary" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="button button-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar fornecedor'}</button></div>
      </form>
    </Modal>
  </>;
}

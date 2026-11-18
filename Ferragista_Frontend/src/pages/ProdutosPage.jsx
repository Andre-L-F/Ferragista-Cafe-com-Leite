import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/Field.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { criarProduto, atualizarProduto, excluirProduto, listarProdutos } from '../services/produtoService.js';
import { listarFornecedores } from '../services/fornecedorService.js';
import { useToast } from '../context/ToastContext.jsx';

const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const emptyForm = { nome: '', descricao: '', preco: '', categoria: '', quantidadeEstoque: '', unidadeMedida: 'UN', dataValidade: '', codigoBarras: '', fornecedorId: '' };

export default function ProdutosPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [productData, supplierData] = await Promise.all([listarProdutos(), listarFornecedores()]);
      setProducts(productData);
      setSuppliers(supplierData);
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, []);

  const categories = useMemo(() => [...new Set(products.map((product) => product.categoria).filter(Boolean))], [products]);
  const rows = products.filter((product) => (category === 'Todas' || product.categoria === category) && `${product.nome} ${product.codigoBarras || ''}`.toLowerCase().includes(query.toLowerCase()));

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(product) {
    setEditing(product);
    setForm({ nome: product.nome || '', descricao: product.descricao || '', preco: product.preco ?? '', categoria: product.categoria || '', quantidadeEstoque: product.quantidadeEstoque ?? '', unidadeMedida: product.unidadeMedida || 'UN', dataValidade: product.dataValidade || '', codigoBarras: product.codigoBarras || '', fornecedorId: product.fornecedor?.id || '' });
    setModalOpen(true);
  }
  function updateField(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function saveProduct(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    setSaving(true);
    const payload = {
      nome: String(values.nome || '').trim(), descricao: String(values.descricao || '').trim(), preco: Number(values.preco), categoria: String(values.categoria || '').trim(),
      quantidadeEstoque: Number(values.quantidadeEstoque), unidadeMedida: values.unidadeMedida || 'UN',
      dataValidade: values.dataValidade || null, codigoBarras: String(values.codigoBarras || '').trim() || null,
      fornecedorId: values.fornecedorId ? Number(values.fornecedorId) : null,
    };
    try {
      if (editing) {
        await atualizarProduto(editing.id, payload);
        toast.success('Produto atualizado com sucesso.');
      } else {
        await criarProduto(payload);
        toast.success('Produto cadastrado com sucesso.');
      }
      setModalOpen(false);
      await loadData();
    } catch (error) { toast.error(error.message); }
    finally { setSaving(false); }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Deseja realmente excluir o produto "${product.nome}"?`)) return;
    try { await excluirProduto(product.id); toast.success('Produto excluído com sucesso.'); await loadData(); }
    catch (error) { toast.error(error.message); }
  }

  return (
    <>
      <PageHeader title="Produtos" subtitle={`${products.length} produtos cadastrados no catálogo.`} actions={<button type="button" className="button button-primary" onClick={openCreate}><Plus size={17} /> Novo Produto</button>} />
      <div className="toolbar"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou código de barras..." /><select className="select-control" value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="inventory-summary"><div className="summary-card"><span className="summary-icon"><Package size={19} /></span><div><small>Produtos cadastrados</small><strong>{products.length}</strong></div></div><div className="summary-card"><span className="summary-icon warning"><AlertTriangle size={19} /></span><div><small>Estoque baixo (até 5 unidades)</small><strong>{products.filter((product) => product.quantidadeEstoque <= 5).length}</strong></div></div></div>
      {loading ? <LoadingState /> : <DataTable columns={['Produto', 'Categoria', 'Preço', 'Estoque', 'Status', 'Ações']} bodyId="tabelaProdutos" empty="Nenhum produto encontrado.">
        {rows.map((product) => <tr key={product.id}>
          <td><div className="table-product"><div className="table-product-icon"><Package size={19} /></div><div><strong>{product.nome}</strong><span>{product.codigoBarras || `ID ${product.id}`}</span></div></div></td>
          <td>{product.categoria}</td><td className="cell-strong">{currency(product.preco)}</td>
          <td>{product.quantidadeEstoque} {product.unidadeMedida || 'UN'}</td>
          <td>{product.quantidadeEstoque <= 5 ? <StatusBadge tone="warning">Estoque baixo</StatusBadge> : <StatusBadge tone="success">Disponível</StatusBadge>}</td>
          <td><div className="table-actions"><button className="icon-button" type="button" aria-label="Editar" title="Editar" onClick={() => openEdit(product)}><Pencil size={16} /><span className="sr-only">Editar</span></button><button className="icon-button danger btn-danger" type="button" aria-label="Excluir" title="Excluir" onClick={() => removeProduct(product)}><Trash2 size={16} /></button></div><button className="test-edit-button" type="button" onClick={() => openEdit(product)}>Editar</button></td>
        </tr>)}
      </DataTable>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar produto' : 'Novo produto'} wide>
        <form id="formProduto" className="form-grid" onSubmit={saveProduct}>
          <Field id="prodNome" label="Nome do produto" required full><input id="prodNome" name="nome" value={form.nome} onChange={updateField} required maxLength={120} /></Field>
          <Field id="prodDescricao" label="Descrição" full><textarea id="prodDescricao" name="descricao" value={form.descricao} onChange={updateField} rows="2" maxLength={255} /></Field>
          <Field id="prodPreco" label="Preço de venda (R$)" required><input id="prodPreco" name="preco" type="number" min="0.01" step="0.01" value={form.preco} onChange={updateField} required /></Field>
          <Field id="prodCategoria" label="Categoria" required><input id="prodCategoria" name="categoria" list="product-categories" value={form.categoria} onChange={updateField} required /><datalist id="product-categories">{categories.map((item) => <option key={item} value={item} />)}<option value="Ferramentas Elétricas" /></datalist></Field>
          <Field id="prodEstoque" label="Quantidade em estoque" required><input id="prodEstoque" name="quantidadeEstoque" type="number" min="0" step="1" value={form.quantidadeEstoque} onChange={updateField} required /></Field>
          <Field id="prodUnidade" label="Unidade de medida"><select id="prodUnidade" name="unidadeMedida" value={form.unidadeMedida} onChange={updateField}><option>UN</option><option>KG</option><option>MT</option><option>L</option><option>LATA</option><option>PCT</option></select></Field>
          <Field id="prodCodigo" label="Código de barras"><input id="prodCodigo" name="codigoBarras" value={form.codigoBarras} onChange={updateField} /></Field>
          <Field id="prodValidade" label="Data de validade"><input id="prodValidade" name="dataValidade" type="date" value={form.dataValidade} onChange={updateField} /></Field>
          <Field id="prodFornecedor" label="Fornecedor" full><select id="prodFornecedor" name="fornecedorId" value={form.fornecedorId} onChange={updateField}><option value="">Sem fornecedor vinculado</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.nomeFantasia}</option>)}</select></Field>
          <div className="form-actions field-full"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancelar</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar produto'}</button></div>
        </form>
      </Modal>
    </>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Banknote, CreditCard, Minus, Plus, QrCode, Search, ShoppingBag, Trash2, Wallet, PackageSearch, CheckCircle2 } from 'lucide-react';
import { listarProdutos } from '../services/produtoService.js';
import { registrarVenda } from '../services/vendaService.js';
import { useToast } from '../context/ToastContext.jsx';
import LoadingState from '../components/LoadingState.jsx';

const paymentOptions = [
  { value: 'PIX', label: 'Pix', icon: QrCode },
  { value: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
  { value: 'CARTAO_CREDITO', label: 'Crédito', icon: CreditCard },
  { value: 'CARTAO_DEBITO', label: 'Débito', icon: Wallet },
  { value: 'BOLETO', label: 'Boleto', icon: CreditCard },
];
const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PdvPage() {
  const toast = useToast();
  const searchRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Consumidor final');
  const [customerCpf, setCustomerCpf] = useState('');
  const [payment, setPayment] = useState('PIX');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  async function loadProducts() {
    setLoading(true);
    try { setProducts(await listarProdutos()); }
    catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); searchRef.current?.focus(); }, []);

  const categories = useMemo(() => ['Todas', ...new Set(products.map((product) => product.categoria).filter(Boolean))], [products]);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const term = search.toLowerCase();
    const matchesSearch = `${product.nome} ${product.codigoBarras || ''} ${product.categoria || ''}`.toLowerCase().includes(term);
    return matchesSearch && (category === 'Todas' || product.categoria === category);
  }), [products, search, category]);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + Number(item.product.preco) * item.quantity, 0);

  function addProduct(product) {
    if (product.quantidadeEstoque <= 0) { toast.error('Este produto está sem estoque.'); return; }
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantidadeEstoque) { toast.error('Quantidade maior que o estoque disponível.'); return current; }
        return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function changeQuantity(productId, delta) {
    setCart((current) => current.map((item) => {
      if (item.product.id !== productId) return item;
      const quantity = item.quantity + delta;
      if (quantity > item.product.quantidadeEstoque) {
        toast.error('Quantidade maior que o estoque disponível.');
        return item;
      }
      return { ...item, quantity };
    }).filter((item) => item.quantity > 0));
  }

  async function finishSale() {
    if (!cart.length) { toast.error('Adicione pelo menos um produto à venda.'); return; }
    if (!customerName.trim()) { toast.error('Informe o nome do cliente.'); return; }
    setSaving(true);
    try {
      const sale = await registrarVenda({
        nomeCliente: customerName.trim(),
        cpfCliente: customerCpf.trim() || null,
        formaPagamento: payment,
        observacoes: notes.trim() || null,
        itens: cart.map((item) => ({ produtoId: item.product.id, quantidade: item.quantity })),
      });
      setCompletedSale(sale);
      setCart([]);
      setCustomerName('Consumidor final');
      setCustomerCpf('');
      setNotes('');
      await loadProducts();
      toast.success('Venda finalizada com sucesso.');
    } catch (error) {
      toast.error(error.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="pdv-layout">
      <section className="catalog-panel">
        <div className="pdv-heading"><div><span className="eyebrow text-gold">ATENDIMENTO DE BALCÃO</span><h1>Ponto de Venda</h1><p>Pesquise e adicione produtos à venda.</p></div><div className="cash-status"><span className="status-light" /> Caixa aberto</div></div>
        <div className="catalog-search"><Search size={19} /><input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto por nome ou código de barras..." aria-label="Buscar produto" /></div>
        <div className="category-pills">{categories.map((item) => <button key={item} type="button" className={category === item ? 'category-pill selected' : 'category-pill'} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {loading ? <LoadingState label="Buscando produtos no estoque..." /> : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <button key={product.id} className="product-card" type="button" onClick={() => addProduct(product)}>
                <span className="product-visual"><ShoppingBag size={26} strokeWidth={1.5} /></span>
                <span className="product-name">{product.nome}</span>
                <span className="product-code">{product.codigoBarras || `PROD-${product.id}`}</span>
                <span className="product-card-bottom"><strong>{currency(product.preco)}</strong><span className={product.quantidadeEstoque <= 5 ? 'stock-low' : 'stock-ok'}>{product.quantidadeEstoque} {product.unidadeMedida || 'un'}</span></span>
              </button>
            ))}
            {!filteredProducts.length && <div className="catalog-empty"><PackageSearch size={34} /><strong>Nenhum produto encontrado</strong><span>Tente alterar a busca ou a categoria selecionada.</span></div>}
          </div>
        )}
      </section>

      <aside className="sale-panel">
        <div className="sale-panel-heading"><div><span className="eyebrow text-gold">NOVA TRANSAÇÃO</span><h2>Venda atual</h2></div><span className="items-counter">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span></div>
        <div className="sale-customer-fields">
          <label className="form-field">Cliente<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Consumidor final" /></label>
          <label className="form-field">CPF (opcional)<input value={customerCpf} onChange={(event) => setCustomerCpf(event.target.value)} placeholder="000.000.000-00" /></label>
        </div>
        <div className="cart-list">
          {!cart.length ? <div className="cart-empty"><div><ShoppingBag size={27} /></div><strong>Sua venda está vazia</strong><span>Selecione produtos no catálogo para começar.</span></div> : cart.map((item) => (
            <div className="cart-item" key={item.product.id}>
              <div className="cart-item-info"><strong>{item.product.nome}</strong><span>{currency(item.product.preco)} / un.</span><b>{currency(Number(item.product.preco) * item.quantity)}</b></div>
              <div className="quantity-control"><button type="button" onClick={() => changeQuantity(item.product.id, -1)} aria-label="Diminuir"><Minus size={14} /></button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.product.id, 1)} aria-label="Aumentar"><Plus size={14} /></button></div>
              <button className="remove-item" type="button" onClick={() => setCart((current) => current.filter((entry) => entry.product.id !== item.product.id))} aria-label="Remover produto"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <div className="sale-footer">
          <label className="form-field">Observações<input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opcional" /></label>
          <div className="payment-section"><span className="payment-label">Forma de pagamento</span><div className="payment-grid">{paymentOptions.map(({ value, label, icon: Icon }) => <button key={value} type="button" className={payment === value ? 'payment-option active' : 'payment-option'} onClick={() => setPayment(value)}><Icon size={17} /><span>{label}</span></button>)}</div></div>
          <div className="sale-total"><span>Total da venda</span><strong>{currency(total)}</strong></div>
          <button type="button" className="button button-primary button-finish" onClick={finishSale} disabled={saving || !cart.length}>{saving ? 'Finalizando venda...' : <>Finalizar venda <span>{currency(total)}</span></>}</button>
          <button type="button" className="button button-quiet button-clear-cart" onClick={() => setCart([])} disabled={!cart.length}>Limpar venda</button>
        </div>
      </aside>

      {completedSale && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setCompletedSale(null)}><section className="modal sale-success-modal"><div className="success-icon"><CheckCircle2 size={34} /></div><span className="eyebrow text-gold">OPERAÇÃO CONCLUÍDA</span><h2>Venda finalizada!</h2><p>Venda #{completedSale.id} registrada com sucesso.</p><strong className="success-total">{currency(completedSale.valorTotal)}</strong><span className="muted-text">{completedSale.itens?.length || totalItems} produto(s) · {paymentOptions.find((item) => item.value === completedSale.formaPagamento)?.label || payment}</span><button className="button button-primary" type="button" onClick={() => { setCompletedSale(null); searchRef.current?.focus(); }}>Próxima venda</button></section></div>}
    </div>
  );
}

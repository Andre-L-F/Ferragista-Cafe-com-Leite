import { useEffect, useState } from 'react';
import { Eye, Ban, CalendarDays } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { cancelarVenda, listarVendas } from '../services/vendaService.js';
import { useToast } from '../context/ToastContext.jsx';

const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const paymentLabel = { DINHEIRO: 'Dinheiro', PIX: 'Pix', CARTAO_CREDITO: 'Cartão de crédito', CARTAO_DEBITO: 'Cartão de débito', BOLETO: 'Boleto' };
const statusLabel = { FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada', PENDENTE: 'Pendente' };

export default function VendasPage() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('TODOS');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  async function load() { setLoading(true); try { setList(await listarVendas()); } catch (error) { toast.error(error.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const rows = list.filter((sale) => (status === 'TODOS' || sale.status === status) && (!date || (sale.dataHora || '').startsWith(date)));
  const formatDate = (dateTime) => dateTime ? new Date(dateTime).toLocaleString('pt-BR') : '—';

  async function cancelSale(sale) {
    if (!window.confirm(`Cancelar a venda #${sale.id}? O estoque será estornado.`)) return;
    try { const updated = await cancelarVenda(sale.id); setSelected(updated); toast.success('Venda cancelada e estoque estornado.'); await load(); }
    catch (error) { toast.error(error.message); }
  }

  return <>
    <PageHeader title="Vendas" subtitle="Consulte as vendas registradas e acompanhe seu status." />
    <div className="toolbar"><label className="date-filter"><CalendarDays size={17} /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><select className="select-control" value={status} onChange={(event) => setStatus(event.target.value)}><option value="TODOS">Todos os status</option><option value="FINALIZADA">Finalizadas</option><option value="PENDENTE">Pendentes</option><option value="CANCELADA">Canceladas</option></select><span className="toolbar-count">{rows.length} venda(s)</span></div>
    {loading ? <LoadingState /> : <DataTable columns={['Venda', 'Data e hora', 'Cliente', 'Pagamento', 'Total', 'Status', 'Ações']}>
      {rows.map((sale) => <tr key={sale.id}><td className="cell-strong">#{sale.id}</td><td>{formatDate(sale.dataHora)}</td><td>{sale.nomeCliente}</td><td>{paymentLabel[sale.formaPagamento] || sale.formaPagamento}</td><td className="cell-strong">{currency(sale.valorTotal)}</td><td><StatusBadge tone={sale.status === 'CANCELADA' ? 'danger' : sale.status === 'FINALIZADA' ? 'success' : 'warning'}>{statusLabel[sale.status] || sale.status}</StatusBadge></td><td><div className="table-actions"><button className="icon-button" type="button" aria-label="Ver detalhes" onClick={() => setSelected(sale)}><Eye size={16} /></button>{sale.status !== 'CANCELADA' && <button className="icon-button danger" type="button" aria-label="Cancelar venda" onClick={() => cancelSale(sale)}><Ban size={16} /></button>}</div></td></tr>)}
    </DataTable>}
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Detalhes da venda #${selected?.id || ''}`}>
      {selected && <div className="sale-detail">
        <div className="detail-line"><span>Data</span><strong>{formatDate(selected.dataHora)}</strong></div>
        <div className="detail-line"><span>Cliente</span><strong>{selected.nomeCliente}</strong></div>
        <div className="detail-line"><span>Pagamento</span><strong>{paymentLabel[selected.formaPagamento] || selected.formaPagamento}</strong></div>
        <div className="detail-line"><span>Status</span><StatusBadge tone={selected.status === 'CANCELADA' ? 'danger' : 'success'}>{statusLabel[selected.status] || selected.status}</StatusBadge></div>
        <h3>Itens da venda</h3>
        <div className="sale-detail-items">{(selected.itens || []).map((item, index) => <div className="sale-detail-item" key={item.id || index}><span>{item.quantidade} × {item.produto?.nome || item.nomeProduto || `Produto ${item.produto?.id || ''}`}</span><strong>{currency(item.subtotal)}</strong></div>)}</div>
        <div className="sale-detail-total"><span>Total</span><strong>{currency(selected.valorTotal)}</strong></div>
        {selected.status !== 'CANCELADA' && <button className="button button-danger button-full" type="button" onClick={() => cancelSale(selected)}>Cancelar venda</button>}
      </div>}
    </Modal>
  </>;
}

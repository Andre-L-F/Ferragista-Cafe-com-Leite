// Verifica autenticação
Auth.exigirAutenticacao();

// Estado Global
let listaProdutosGlobal = [];
let listaFornecedoresGlobal = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  const usuario = Auth.obterUsuario();
  if (usuario) {
    document.getElementById('navUserName').innerText = usuario.nome || usuario.username;
    document.getElementById('navUserRole').innerText = usuario.perfil || 'USUÁRIO';
  }
  carregarProdutos();
  carregarFornecedores();
  carregarVendas();
  carregarUsuarios();
});

// Navegação entre abas
function trocarAba(nomeAba, elementoBtn) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  const alvo = document.getElementById('tab-' + nomeAba);
  if (alvo) alvo.classList.add('active');
  if (elementoBtn) elementoBtn.classList.add('active');
}

// Alertas
function mostrarAlerta(mensagem, tipo = 'success') {
  const alertDiv = document.getElementById('globalAlert');
  alertDiv.className = 'alert ' + (tipo === 'success' ? 'alert-success' : 'alert-danger');
  alertDiv.innerHTML = mensagem;
  alertDiv.style.display = 'block';
  setTimeout(() => { alertDiv.style.display = 'none'; }, 5000);
}

// Modais
function fecharModal(idModal) {
  document.getElementById(idModal).classList.remove('show');
}
function abrirModal(idModal) {
  document.getElementById(idModal).classList.add('show');
}

/* ==========================================================
   1. CRUD DE PRODUTOS
   ========================================================== */
async function carregarProdutos() {
  const busca = document.getElementById('filtroProdutoNome')?.value.trim() || '';
  const categoria = document.getElementById('filtroProdutoCategoria')?.value.trim() || '';

  let url = '/api/produtos?';
  if (busca) url += 'busca=' + encodeURIComponent(busca) + '&';
  if (categoria) url += 'categoria=' + encodeURIComponent(categoria) + '&';

  try {
    const res = await fetch(url, { headers: Auth.headersComAuth() });
    if (!res.ok) throw new Error('Falha ao listar produtos');
    const produtos = await res.json();
    listaProdutosGlobal = produtos;

    const tbody = document.getElementById('tabelaProdutos');
    if (produtos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Nenhum produto cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = produtos.map(p => {
      const validade = p.dataValidade ? p.dataValidade.split('-').reverse().join('/') : '-';
      const fornecedorNome = p.fornecedor ? p.fornecedor.nomeFantasia : '-';
      const badgeEstoque = p.quantidadeEstoque <= 5 
        ? `<span class="badge badge-danger">${p.quantidadeEstoque}</span>` 
        : `<span class="badge badge-success">${p.quantidadeEstoque}</span>`;

      return `
        <tr>
          <td><strong>#${p.id}</strong></td>
          <td><strong>${p.nome}</strong><br><small style="color: var(--text-muted);">${p.descricao || ''}</small></td>
          <td><span class="badge badge-info">${p.categoria}</span></td>
          <td>R$ ${Number(p.preco).toFixed(2).replace('.', ',')}</td>
          <td>${badgeEstoque}</td>
          <td>${p.unidadeMedida}</td>
          <td>${validade}</td>
          <td>${fornecedorNome}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick='editarProduto(${JSON.stringify(p)})'>✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deletarProduto(${p.id})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    mostrarAlerta('Erro ao carregar produtos: ' + err.message, 'danger');
  }
}

function abrirModalProduto() {
  document.getElementById('formProduto').reset();
  document.getElementById('prodId').value = '';
  document.getElementById('tituloModalProduto').innerText = 'Cadastrar Produto';
  popularSelectFornecedores('prodFornecedorId');
  abrirModal('modalProduto');
}

function editarProduto(p) {
  document.getElementById('prodId').value = p.id;
  document.getElementById('prodNome').value = p.nome;
  document.getElementById('prodDescricao').value = p.descricao || '';
  document.getElementById('prodPreco').value = p.preco;
  document.getElementById('prodCategoria').value = p.categoria;
  document.getElementById('prodEstoque').value = p.quantidadeEstoque;
  document.getElementById('prodUnidade').value = p.unidadeMedida || 'UN';
  document.getElementById('prodValidade').value = p.dataValidade || '';
  document.getElementById('prodCodigoBarras').value = p.codigoBarras || '';
  document.getElementById('tituloModalProduto').innerText = 'Editar Produto #' + p.id;

  popularSelectFornecedores('prodFornecedorId', p.fornecedor ? p.fornecedor.id : null);
  abrirModal('modalProduto');
}

async function salvarProduto(event) {
  event.preventDefault();
  const id = document.getElementById('prodId').value;
  const dto = {
    nome: document.getElementById('prodNome').value.trim(),
    descricao: document.getElementById('prodDescricao').value.trim(),
    preco: parseFloat(document.getElementById('prodPreco').value),
    categoria: document.getElementById('prodCategoria').value.trim(),
    quantidadeEstoque: parseInt(document.getElementById('prodEstoque').value, 10),
    unidadeMedida: document.getElementById('prodUnidade').value,
    dataValidade: document.getElementById('prodValidade').value || null,
    codigoBarras: document.getElementById('prodCodigoBarras').value.trim() || null,
    fornecedorId: document.getElementById('prodFornecedorId').value ? parseInt(document.getElementById('prodFornecedorId').value) : null
  };

  try {
    const url = id ? `/api/produtos/${id}` : '/api/produtos';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: Auth.headersComAuth(),
      body: JSON.stringify(dto)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao salvar produto');

    fecharModal('modalProduto');
    mostrarAlerta(`Produto <strong>${data.nome}</strong> ${id ? 'atualizado' : 'cadastrado'} com sucesso!`);
    carregarProdutos();
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

async function deletarProduto(id) {
  if (!confirm('Deseja realmente excluir este produto?')) return;
  try {
    const res = await fetch(`/api/produtos/${id}`, {
      method: 'DELETE',
      headers: Auth.headersComAuth()
    });
    if (!res.ok) throw new Error('Não foi possível excluir o produto');
    mostrarAlerta('Produto excluído com sucesso!');
    carregarProdutos();
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

/* ==========================================================
   2. CRUD DE FORNECEDORES
   ========================================================== */
async function carregarFornecedores() {
  const busca = document.getElementById('filtroFornecedor')?.value.trim() || '';
  let url = '/api/fornecedores' + (busca ? '?busca=' + encodeURIComponent(busca) : '');

  try {
    const res = await fetch(url, { headers: Auth.headersComAuth() });
    if (!res.ok) throw new Error('Falha ao listar fornecedores');
    const fornecedores = await res.json();
    listaFornecedoresGlobal = fornecedores;

    const tbody = document.getElementById('tabelaFornecedores');
    if (fornecedores.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Nenhum fornecedor cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = fornecedores.map(f => `
      <tr>
        <td><strong>#${f.id}</strong></td>
        <td><strong>${f.nomeFantasia}</strong></td>
        <td>${f.razaoSocial}</td>
        <td><code>${f.cnpj}</code></td>
        <td>${f.telefone}</td>
        <td>${f.email || '-'}</td>
        <td>${f.cidade} / ${f.estado}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick='editarFornecedor(${JSON.stringify(f)})'>✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deletarFornecedor(${f.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    mostrarAlerta('Erro ao carregar fornecedores: ' + err.message, 'danger');
  }
}

function popularSelectFornecedores(selectId, selecionadoId = null) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '<option value="">Sem fornecedor vinculado</option>' +
    listaFornecedoresGlobal.map(f => `
      <option value="${f.id}" ${selecionadoId === f.id ? 'selected' : ''}>
        ${f.nomeFantasia} (${f.cidade}/${f.estado})
      </option>
    `).join('');
}

function abrirModalFornecedor() {
  document.getElementById('formFornecedor').reset();
  document.getElementById('fornId').value = '';
  document.getElementById('tituloModalFornecedor').innerText = 'Cadastrar Fornecedor';
  abrirModal('modalFornecedor');
}

function editarFornecedor(f) {
  document.getElementById('fornId').value = f.id;
  document.getElementById('fornNomeFantasia').value = f.nomeFantasia;
  document.getElementById('fornRazaoSocial').value = f.razaoSocial;
  document.getElementById('fornCnpj').value = f.cnpj;
  document.getElementById('fornTelefone').value = f.telefone;
  document.getElementById('fornEmail').value = f.email || '';
  document.getElementById('fornCidade').value = f.cidade;
  document.getElementById('fornEstado').value = f.estado;
  document.getElementById('tituloModalFornecedor').innerText = 'Editar Fornecedor #' + f.id;
  abrirModal('modalFornecedor');
}

async function salvarFornecedor(event) {
  event.preventDefault();
  const id = document.getElementById('fornId').value;
  const dto = {
    nomeFantasia: document.getElementById('fornNomeFantasia').value.trim(),
    razaoSocial: document.getElementById('fornRazaoSocial').value.trim(),
    cnpj: document.getElementById('fornCnpj').value.trim(),
    telefone: document.getElementById('fornTelefone').value.trim(),
    email: document.getElementById('fornEmail').value.trim() || null,
    cidade: document.getElementById('fornCidade').value.trim(),
    estado: document.getElementById('fornEstado').value.trim().toUpperCase()
  };

  try {
    const url = id ? `/api/fornecedores/${id}` : '/api/fornecedores';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: Auth.headersComAuth(),
      body: JSON.stringify(dto)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao salvar fornecedor');

    fecharModal('modalFornecedor');
    mostrarAlerta(`Fornecedor <strong>${data.nomeFantasia}</strong> salvo com sucesso!`);
    carregarFornecedores();
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

async function deletarFornecedor(id) {
  if (!confirm('Deseja excluir este fornecedor?')) return;
  try {
    const res = await fetch(`/api/fornecedores/${id}`, {
      method: 'DELETE',
      headers: Auth.headersComAuth()
    });
    if (!res.ok) throw new Error('Não foi possível excluir o fornecedor');
    mostrarAlerta('Fornecedor excluído com sucesso!');
    carregarFornecedores();
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

/* ==========================================================
   3. CRUD DE VENDAS
   ========================================================== */
async function carregarVendas() {
  try {
    const res = await fetch('/api/vendas', { headers: Auth.headersComAuth() });
    if (!res.ok) throw new Error('Falha ao listar vendas');
    const vendas = await res.json();

    const tbody = document.getElementById('tabelaVendas');
    if (vendas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Nenhuma venda registrada ainda.</td></tr>';
      return;
    }

    tbody.innerHTML = vendas.map(v => {
      const dataFormatada = v.dataHora ? v.dataHora.replace('T', ' ').substring(0, 16) : '-';
      const badgeStatus = v.status === 'FINALIZADA' 
        ? '<span class="badge badge-success">Finalizada</span>'
        : (v.status === 'CANCELADA' ? '<span class="badge badge-danger">Cancelada</span>' : '<span class="badge badge-warning">Pendente</span>');

      const resumoItens = (v.itens || []).map(i => `${i.quantidade}x ${i.produto?.nome || 'Item'}`).join(', ');

      const botaoCancelar = v.status === 'FINALIZADA'
        ? `<button class="btn btn-outline btn-sm" style="color: #ea580c; border-color: #ea580c;" onclick="cancelarVenda(${v.id})">❌ Cancelar</button>`
        : '';

      return `
        <tr>
          <td><strong>#${v.id}</strong></td>
          <td>${dataFormatada}</td>
          <td><strong>${v.nomeCliente}</strong></td>
          <td>${v.cpfCliente || '-'}</td>
          <td><span class="badge badge-purple">${v.formaPagamento}</span></td>
          <td><strong style="color: var(--success);">R$ ${Number(v.valorTotal).toFixed(2).replace('.', ',')}</strong></td>
          <td>${badgeStatus}</td>
          <td><small title="${resumoItens}">${resumoItens.length > 35 ? resumoItens.substring(0, 35) + '...' : resumoItens}</small></td>
          <td>
            ${botaoCancelar}
            <button class="btn btn-danger btn-sm" onclick="deletarVenda(${v.id})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    mostrarAlerta('Erro ao carregar vendas: ' + err.message, 'danger');
  }
}

function abrirModalVenda() {
  document.getElementById('formVenda').reset();
  document.getElementById('containerItensVenda').innerHTML = '';
  document.getElementById('vendaTotalDisplay').innerText = 'R$ 0,00';
  adicionarLinhaItem();
  abrirModal('modalVenda');
}

function adicionarLinhaItem() {
  const container = document.getElementById('containerItensVenda');
  const index = container.children.length;

  const div = document.createElement('div');
  div.className = 'form-row';
  div.style.marginBottom = '0.75rem';
  div.style.alignItems = 'center';
  div.id = 'linhaItem_' + index;

  div.innerHTML = `
    <div style="flex: 2;">
      <select class="form-select select-produto-item" required onchange="recalcularTotalVenda()">
        <option value="">Selecione o produto...</option>
        ${listaProdutosGlobal.map(p => `
          <option value="${p.id}" data-preco="${p.preco}" data-estoque="${p.quantidadeEstoque}">
            ${p.nome} (Estoque: ${p.quantidadeEstoque}) - R$ ${Number(p.preco).toFixed(2).replace('.', ',')}
          </option>
        `).join('')}
      </select>
    </div>
    <div style="flex: 1; max-width: 110px;">
      <input type="number" min="1" value="1" class="form-control input-qtd-item" required placeholder="Qtd" oninput="recalcularTotalVenda()">
    </div>
    <div style="flex: 1; max-width: 120px; font-weight: 700; color: #1e293b;" class="subtotal-item-display">
      R$ 0,00
    </div>
    <div style="max-width: 45px;">
      <button type="button" class="btn btn-outline btn-sm" style="color: #dc2626;" onclick="removerLinhaItem('${div.id}')">✕</button>
    </div>
  `;

  container.appendChild(div);
  recalcularTotalVenda();
}

function removerLinhaItem(idLinha) {
  const container = document.getElementById('containerItensVenda');
  if (container.children.length <= 1) {
    alert('A venda deve conter pelo menos 1 item');
    return;
  }
  const el = document.getElementById(idLinha);
  if (el) el.remove();
  recalcularTotalVenda();
}

function recalcularTotalVenda() {
  const linhas = document.querySelectorAll('#containerItensVenda .form-row');
  let total = 0;

  linhas.forEach(linha => {
    const select = linha.querySelector('.select-produto-item');
    const inputQtd = linha.querySelector('.input-qtd-item');
    const subtotalDisplay = linha.querySelector('.subtotal-item-display');

    const opcao = select.options[select.selectedIndex];
    const preco = opcao && opcao.dataset.preco ? parseFloat(opcao.dataset.preco) : 0;
    const qtd = inputQtd ? parseInt(inputQtd.value, 10) || 0 : 0;

    const subtotal = preco * qtd;
    total += subtotal;

    if (subtotalDisplay) {
      subtotalDisplay.innerText = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
    }
  });

  document.getElementById('vendaTotalDisplay').innerText = 'R$ ' + total.toFixed(2).replace('.', ',');
}

async function finalizarVenda(event) {
  event.preventDefault();
  const linhas = document.querySelectorAll('#containerItensVenda .form-row');
  const itens = [];

  linhas.forEach(linha => {
    const select = linha.querySelector('.select-produto-item');
    const inputQtd = linha.querySelector('.input-qtd-item');
    if (select.value && inputQtd.value) {
      itens.push({
        produtoId: parseInt(select.value, 10),
        quantidade: parseInt(inputQtd.value, 10)
      });
    }
  });

  if (itens.length === 0) {
    alert('Adicione pelo menos um item com produto selecionado!');
    return;
  }

  const dto = {
    nomeCliente: document.getElementById('vendaClienteNome').value.trim(),
    cpfCliente: document.getElementById('vendaClienteCpf').value.trim() || null,
    formaPagamento: document.getElementById('vendaFormaPagamento').value,
    observacoes: document.getElementById('vendaObservacoes').value.trim() || null,
    itens: itens
  };

  try {
    const res = await fetch('/api/vendas', {
      method: 'POST',
      headers: Auth.headersComAuth(),
      body: JSON.stringify(dto)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao registrar venda');

    fecharModal('modalVenda');
    mostrarAlerta(`Venda <strong>#${data.id}</strong> finalizada com sucesso! Total: R$ ${Number(data.valorTotal).toFixed(2).replace('.', ',')}`);
    carregarVendas();
    carregarProdutos(); // Atualiza quantidade em estoque no painel
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

async function cancelarVenda(id) {
  if (!confirm(`Deseja cancelar a venda #${id}? Os itens serão estornados para o estoque da ferragista.`)) return;
  try {
    const res = await fetch(`/api/vendas/${id}/cancelar`, {
      method: 'PATCH',
      headers: Auth.headersComAuth()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao cancelar venda');

    mostrarAlerta(`Venda #${id} cancelada e estoque estornado com sucesso!`);
    carregarVendas();
    carregarProdutos();
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

async function deletarVenda(id) {
  if (!confirm(`Excluir o registro da venda #${id}?`)) return;
  try {
    const res = await fetch(`/api/vendas/${id}`, {
      method: 'DELETE',
      headers: Auth.headersComAuth()
    });
    if (!res.ok) throw new Error('Não foi possível excluir a venda');

    mostrarAlerta('Venda excluída!');
    carregarVendas();
    carregarProdutos();
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

/* ==========================================================
   4. CRUD DE USUÁRIOS
   ========================================================== */
async function carregarUsuarios() {
  try {
    const res = await fetch('/api/usuarios', { headers: Auth.headersComAuth() });
    if (!res.ok) throw new Error('Falha ao listar usuários');
    const usuarios = await res.json();

    const tbody = document.getElementById('tabelaUsuarios');
    if (usuarios.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Nenhum usuário cadastrado.</td></tr>';
      return;
    }

    tbody.innerHTML = usuarios.map(u => {
      const dataCriacao = u.dataCadastro ? u.dataCadastro.substring(0, 10).split('-').reverse().join('/') : '-';
      const statusBadge = u.ativo 
        ? '<span class="badge badge-success">Ativo</span>' 
        : '<span class="badge badge-danger">Inativo</span>';

      return `
        <tr>
          <td><strong>#${u.id}</strong></td>
          <td><strong>${u.nome}</strong></td>
          <td><code>${u.username}</code></td>
          <td>${u.email}</td>
          <td><span class="badge badge-info">${u.perfil}</span></td>
          <td>${statusBadge}</td>
          <td>${dataCriacao}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick='editarUsuario(${JSON.stringify(u)})'>✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deletarUsuario(${u.id})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    mostrarAlerta('Erro ao carregar usuários: ' + err.message, 'danger');
  }
}

function abrirModalUsuario() {
  document.getElementById('formUsuario').reset();
  document.getElementById('userId').value = '';
  document.getElementById('tituloModalUsuario').innerText = 'Cadastrar Usuário';
  document.getElementById('userSenha').required = true;
  document.getElementById('ajudaSenha').style.display = 'none';
  abrirModal('modalUsuario');
}

function editarUsuario(u) {
  document.getElementById('userId').value = u.id;
  document.getElementById('userNome').value = u.nome;
  document.getElementById('userUsername').value = u.username;
  document.getElementById('userEmail').value = u.email;
  document.getElementById('userSenha').value = '';
  document.getElementById('userSenha').required = false;
  document.getElementById('ajudaSenha').style.display = 'block';
  document.getElementById('userPerfil').value = u.perfil;
  document.getElementById('userAtivo').value = u.ativo.toString();
  document.getElementById('tituloModalUsuario').innerText = 'Editar Usuário #' + u.id;
  abrirModal('modalUsuario');
}

async function salvarUsuario(event) {
  event.preventDefault();
  const id = document.getElementById('userId').value;
  const dto = {
    nome: document.getElementById('userNome').value.trim(),
    username: document.getElementById('userUsername').value.trim(),
    email: document.getElementById('userEmail').value.trim(),
    perfil: document.getElementById('userPerfil').value,
    ativo: document.getElementById('userAtivo').value === 'true'
  };

  const senha = document.getElementById('userSenha').value;
  if (senha) {
    dto.senha = senha;
  }

  try {
    const url = id ? `/api/usuarios/${id}` : '/api/usuarios';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: Auth.headersComAuth(),
      body: JSON.stringify(dto)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro ao salvar usuário');

    fecharModal('modalUsuario');
    mostrarAlerta(`Usuário <strong>${data.username}</strong> salvo com sucesso!`);
    carregarUsuarios();
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

async function deletarUsuario(id) {
  const usuarioLogado = Auth.obterUsuario();
  if (usuarioLogado && usuarioLogado.id === id) {
    alert('Você não pode excluir o usuário com o qual está atualmente conectado!');
    return;
  }

  if (!confirm(`Deseja realmente excluir o usuário #${id}?`)) return;

  try {
    const res = await fetch(`/api/usuarios/${id}`, {
      method: 'DELETE',
      headers: Auth.headersComAuth()
    });
    if (!res.ok) throw new Error('Não foi possível excluir o usuário');

    mostrarAlerta('Usuário excluído com sucesso!');
    carregarUsuarios();
  } catch (err) {
    mostrarAlerta(err.message, 'danger');
  }
}

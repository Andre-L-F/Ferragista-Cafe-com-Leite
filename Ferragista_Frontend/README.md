# Ferragista Café com Leite — Front-end

Aplicação front-end do PDV da Ferragista Café com Leite, construída com React, JavaScript (JSX), Vite, React Router, CSS tradicional e Lucide React. A comunicação com o back-end é feita pela Fetch API.

## Requisitos

- Node.js 20.19+ ou 22.12+ (Node 24 também é compatível com esta configuração do Vite)
- Back-end Spring Boot disponível em `http://localhost:8080`

## Instalação e execução local

1. Entre na pasta `Ferragista_Frontend`.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Copie `.env.example` para `.env` se quiser alterar o endereço da API. O padrão é `http://localhost:8080/api`.
4. Inicie o front-end:

   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:5173/login.html`.

Inicie o back-end Spring Boot antes de testar login, listagem de produtos e operações do PDV.

## Credenciais de desenvolvimento

O `DataInitializer` do back-end cria estes usuários em uma base nova:

- Administrador: `admin` / `admin123`
- Vendedor: `vendedor` / `vendedor123`

## Integração com o Selenium do projeto

Os testes E2E existentes abrem `/login.html` e `/index.html` no servidor Spring Boot. O script abaixo compila o front e copia o resultado para `Ferragista_Backend/src/main/resources/static`:

```bash
npm run deploy:backend
```

O comando pressupõe que `Ferragista_Frontend` e `Ferragista_Backend` estejam lado a lado na raiz do repositório. Depois, execute os testes Selenium a partir do back-end.

O front mantém os IDs usados nos testes existentes: `loginForm`, `username`, `password`, `btnLogin`, `loginAlert`, `navUserName`, `navUserRole`, `formProduto`, `prodNome`, `prodDescricao`, `prodPreco`, `prodCategoria`, `prodEstoque`, `tabelaProdutos` e `globalAlert`.

A navegação utiliza `HashRouter` intencionalmente: assim, as telas internas podem ser acessadas e recarregadas quando o front estiver servido como arquivos estáticos pelo Spring Boot, sem exigir uma regra adicional de fallback no back-end.

## Rotas

- `/login.html`: login.
- `/index.html#/pdv`: ponto de venda (tela inicial após autenticação).
- `#/produtos`: produtos.
- `#/fornecedores`: fornecedores.
- `#/clientes`: clientes.
- `#/vendas`: histórico de vendas.
- `#/usuarios`: usuários.

O dashboard do protótipo foi retirado da navegação. O sistema direciona o operador diretamente ao PDV depois do login.

## Observações de integração

Os serviços usam os contratos atualmente publicados pelo Spring Boot. O sistema de clientes do back-end exige CPF e não possui o campo PF/PJ; por isso, o formulário atual segue o modelo de cliente disponível na API.

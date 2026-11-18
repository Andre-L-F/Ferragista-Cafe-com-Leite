# 🔨 Sistema de Vendas de Ferragista - Backend & API REST

Sistema funcional completo de vendas para comércio de ferragens e materiais de construção (**Ferragista**), desenvolvido em **Java 17/25** com **Spring Boot 3**, **Spring Data JPA** e banco de dados **H2**.

---

## 📋 Atendimento aos Requisitos Funcionais

| Requisito | Detalhamento no Projeto | Status |
| :--- | :--- | :---: |
| **03 Entidades de CRUD distintas de negócio** *(exceto Usuário)* | 1. **Produto** (`/api/produtos`)<br>2. **Fornecedor** (`/api/fornecedores`)<br>3. **Venda** com itens e baixa de estoque (`/api/vendas`)<br>*Bônus:* **Cliente** (`/api/clientes`) |  **100% Atendido** |
| **No mínimo 05 atributos específicos por entidade** | - **Produto**: 10 atributos (`id`, `nome`, `descricao`, `preco`, `categoria`, `quantidadeEstoque`, `unidadeMedida`, `dataValidade`, `codigoBarras`, `fornecedor`)<br>- **Fornecedor**: 8 atributos (`id`, `razaoSocial`, `nomeFantasia`, `cnpj`, `telefone`, `email`, `cidade`, `estado`)<br>- **Venda**: 9 atributos (`id`, `dataHora`, `nomeCliente`, `cpfCliente`, `formaPagamento`, `valorTotal`, `status`, `observacoes`, `itens`)<br>- **Cliente**: 7 atributos (`id`, `nome`, `cpf`, `telefone`, `email`, `endereco`, `cidade`) |  **100% Atendido** |
| **01 CRUD de Usuário** | Entidade **Usuario** (`id`, `nome`, `email`, `username`, `senha`, `perfil`, `ativo`, `dataCadastro`) com endpoints para Criar, Listar, Buscar por ID, Atualizar e Excluir. |  **100% Atendido** |
| **Tela de Login funcional com autenticação** | Interface moderna responsiva servida em `/login.html` conectada ao endpoint `/api/auth/login`, com validação instantânea, armazenamento de token de sessão e redirecionamento para o Dashboard administrativo. |  **100% Atendido** |

---

## 🚀 Como Executar o Projeto

### Opção 1: Pelo IntelliJ IDEA (Recomendado)
1. Abra a pasta `Ferragista_Backend` no IntelliJ IDEA.
2. Localize a classe principal: `src/main/java/com/ferragista/FerragistaBackendApplication.java`.
3. Clique no botão verde de **Run** (ou pressione `Shift + F10`).
4. Acesse no navegador: **[http://localhost:8080/login.html](http://localhost:8080/login.html)**.

### Opção 2: Pelo Terminal / Linha de Comando (Maven)
Execute na raiz do projeto (`Ferragista_Backend`):
```bash
mvn spring-boot:run
```

---

## 🔐 Credenciais de Acesso Pré-Cadastradas

O sistema possui um `DataInitializer` que inicializa o banco em memória com usuários prontos para teste:

| Usuário | Senha | Perfil / Cargo | Descrição |
| :--- | :--- | :---: | :--- |
| `admin` | `admin123` | **ADMIN** | Acesso completo a todas as funções |
| `vendedor` | `vendedor123` | **VENDEDOR** | Operador de balcão e vendas |

*(A tela de login possui atalhos de preenchimento rápido para agilizar a avaliação).*

---

## 🌐 Telas e Recursos Web Disponíveis

- **Tela de Login:** [http://localhost:8080/login.html](http://localhost:8080/login.html) ou [http://localhost:8080/login](http://localhost:8080/login)
- **Painel Dashboard Geral:** [http://localhost:8080/index.html](http://localhost:8080/index.html) (Gerenciamento visual completo de Produtos, Fornecedores, Vendas e Usuários)
- **Console do Banco H2:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - **JDBC URL:** `jdbc:h2:mem:ferragistadb`
  - **User Name:** `sa`
  - **Password:** *(deixe em branco)*

---

## 📡 Documentação da API REST (Endpoints)

### 1. Autenticação (`/api/auth`)
- `POST /api/auth/login`: Autentica usuário com `{ "login": "admin", "senha": "admin123" }` e retorna o Bearer token e dados do usuário.
- `POST /api/auth/logout`: Invalida a sessão ativa.
- `GET /api/auth/me`: Retorna os dados do usuário autenticado atual.

### 2. CRUD de Usuários (`/api/usuarios`)
- `GET /api/usuarios`: Lista todos os usuários cadastrados.
- `GET /api/usuarios/{id}`: Retorna os detalhes de um usuário.
- `POST /api/usuarios`: Cria um novo usuário (criptografa a senha com hash SHA-256 e salt seguro).
- `PUT /api/usuarios/{id}`: Atualiza os dados de um usuário (nome, e-mail, perfil, status, senha).
- `DELETE /api/usuarios/{id}`: Exclui o usuário do sistema.

### 3. CRUD de Produtos (`/api/produtos`)
- `GET /api/produtos`: Lista todos os produtos (suporta filtros `?busca=nome` e `?categoria=Hidraulica`).
- `GET /api/produtos/{id}`: Retorna detalhes do produto.
- `POST /api/produtos`: Cadastra novo produto (com validação de preço, estoque e vínculo opcional a fornecedor).
- `PUT /api/produtos/{id}`: Atualiza informações do produto.
- `DELETE /api/produtos/{id}`: Remove o produto.

### 4. CRUD de Fornecedores (`/api/fornecedores`)
- `GET /api/fornecedores`: Lista fornecedores (suporta busca `?busca=nome`).
- `GET /api/fornecedores/{id}`: Retorna fornecedor por ID.
- `POST /api/fornecedores`: Cadastra fornecedor (validação de CNPJ único, razão social, telefone, UF).
- `PUT /api/fornecedores/{id}`: Atualiza dados do fornecedor.
- `DELETE /api/fornecedores/{id}`: Exclui o fornecedor.

### 5. CRUD de Vendas (`/api/vendas`)
- `GET /api/vendas`: Lista histórico de vendas (suporta filtro `?status=FINALIZADA`).
- `GET /api/vendas/{id}`: Retorna detalhes da venda com todos os seus itens calculados.
- `POST /api/vendas`: Registra uma nova venda, calcula subtotal e total automaticamente, e **efetua a baixa de estoque dos produtos**.
- `PATCH /api/vendas/{id}/cancelar`: Cancela a venda e **estorna as quantidades de volta ao estoque da ferragista**.
- `DELETE /api/vendas/{id}`: Remove o registro da venda e reverte o estoque.

---

## 🏗️ Estrutura de Diretórios

```
Ferragista_Backend/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com/ferragista/
    │   │   ├── FerragistaBackendApplication.java
    │   │   ├── config/
    │   │   │   ├── DataInitializer.java
    │   │   │   └── WebConfig.java
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   ├── ClienteController.java
    │   │   │   ├── FornecedorController.java
    │   │   │   ├── ProdutoController.java
    │   │   │   ├── UsuarioController.java
    │   │   │   └── VendaController.java
    │   │   ├── dto/
    │   │   │   ├── FornecedorDTO.java
    │   │   │   ├── ItemVendaDTO.java
    │   │   │   ├── LoginRequestDTO.java
    │   │   │   ├── LoginResponseDTO.java
    │   │   │   ├── ProdutoDTO.java
    │   │   │   ├── UsuarioDTO.java
    │   │   │   └── VendaDTO.java
    │   │   ├── exception/
    │   │   │   ├── BusinessException.java
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   ├── ResourceNotFoundException.java
    │   │   │   └── UnauthorizedException.java
    │   │   ├── model/
    │   │   │   ├── Cliente.java
    │   │   │   ├── Fornecedor.java
    │   │   │   ├── ItemVenda.java
    │   │   │   ├── Produto.java
    │   │   │   ├── Usuario.java
    │   │   │   ├── Venda.java
    │   │   │   └── enums/
    │   │   │       ├── FormaPagamento.java
    │   │   │       ├── PerfilUsuario.java
    │   │   │       └── StatusVenda.java
    │   │   ├── repository/
    │   │   │   ├── ClienteRepository.java
    │   │   │   ├── FornecedorRepository.java
    │   │   │   ├── ProdutoRepository.java
    │   │   │   ├── UsuarioRepository.java
    │   │   │   └── VendaRepository.java
    │   │   ├── service/
    │   │   │   ├── AuthService.java
    │   │   │   ├── FornecedorService.java
    │   │   │   ├── ProdutoService.java
    │   │   │   ├── UsuarioService.java
    │   │   │   └── VendaService.java
    │   │   └── util/
    │   │       └── PasswordUtils.java
    │   └── resources/
    │       ├── application.properties
    │       └── static/
    │           ├── index.html
    │           ├── login.html
    │           ├── css/
    │           │   └── style.css
    │           └── js/
    │               ├── app.js
    │               └── auth.js
    └── test/
        └── java/com/ferragista/
            └── FerragistaBackendApplicationTests.java
```

---

## 🧪 Testes Automatizados (Projeto N2 – Testes de Software)

| Nível | Framework | Mínimo exigido | Implementado | Local |
| :--- | :---: | :---: | :---: | :--- |
| Unitários | **JUnit 5** (+ Mockito) | 3 | **11** | `src/test/java/com/ferragista/unit` |
| API REST | **REST-assured** | 2 | **6** | `src/test/java/com/ferragista/api` |
| Integração / E2E | **Selenium WebDriver** | 2 | **5** | `src/test/java/com/ferragista/e2e` |

### Testes Unitários (JUnit) – sem banco e sem Spring
- `PasswordUtilsTest` (3): hash determinístico, validação de senha correta/incorreta e senha vazia.
- `ProdutoServiceTest` (4): débito de estoque, estoque insuficiente, estorno e produto não encontrado.
- `VendaServiceTest` (4): cálculo do total + baixa de estoque, venda sem itens, cancelamento com estorno e cancelamento duplicado.

### Testes de API (REST-assured) – sobem a aplicação em porta aleatória
- `AuthApiTest` (3): login válido (200 + token), login inválido (401) e `/api/auth/me` com/sem token.
- `ProdutoApiTest` (3): CRUD completo de produto (201/200/204/404), validação de dados inválidos (400) e fluxo de venda (baixa de estoque, estoque insuficiente e cancelamento com estorno).

### Testes de Integração / E2E (Selenium) – controlam o Chrome de verdade
- `LoginE2ETest` (3): login válido leva ao painel, login inválido mostra erro, painel sem login redireciona.
- `ProdutoE2ETest` (2): cadastrar produto pela tela e editar + excluir produto pela tela.

### Como executar os testes
Pré-requisitos: **Java 17+**, **Maven** e **Google Chrome** instalado (o Selenium baixa o driver automaticamente, é preciso internet na primeira execução).

```bash
# Todos os testes (o Chrome abre na tela — ideal para gravar o vídeo)
mvn test

# Sem abrir janela do navegador
mvn test -Dselenium.headless=true

# Apenas um nível de teste
mvn test -Dtest="com.ferragista.unit.*Test"
mvn test -Dtest="com.ferragista.api.*Test"
mvn test -Dtest="com.ferragista.e2e.*Test"
```

> Não é necessário subir o sistema antes: cada classe de teste de API/E2E inicia a aplicação sozinha (H2 em memória com os dados do `DataInitializer`).
> Os relatórios ficam em `target/surefire-reports/`.

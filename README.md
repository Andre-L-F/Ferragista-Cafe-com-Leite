# Ferragista Café com Leite — Sistema PDV

Sistema de ponto de venda para uma ferragista, desenvolvido como projeto acadêmico da disciplina **Testes de Software**. O sistema permite autenticação de usuários, gerenciamento de produtos, fornecedores, clientes e usuários, além da realização e consulta de vendas.

## Integrantes

ARthur Ferreira
Andre Luiz 
Cristiano Alves

## Tecnologias utilizadas

- **Back-end:** Java 17, Spring Boot 3, Spring Data JPA e H2.
- **Front-end:** React, JavaScript (JSX), Vite, React Router e CSS.
- **Testes:** JUnit, REST-assured e Selenium WebDriver.

## Requisitos para executar

- Java JDK 17.
- Node.js 20.19+ (ou 22.12+) e npm.
- IntelliJ IDEA com suporte a Maven, ou Maven instalado e configurado.
- Google Chrome para executar os testes Selenium.

## Como iniciar o sistema

O projeto possui duas pastas principais: `Ferragista_Backend` e `Ferragista_Frontend`.

### 1. Iniciar o back-end

1. Abra a pasta `Ferragista_Backend` no IntelliJ IDEA.
2. Aguarde o IntelliJ importar as dependências do Maven.
3. Abra a classe `src/main/java/com/ferragista/FerragistaBackendApplication.java`.
4. Execute a classe pelo botão **Run**.

O back-end será iniciado em:

`http://localhost:8080`

Se o Maven estiver instalado no computador, também é possível iniciar pelo terminal, dentro de `Ferragista_Backend`:

```bash
mvn spring-boot:run
```

### 2. Iniciar o front-end em modo de desenvolvimento

Com o back-end em execução, abra outro terminal na pasta `Ferragista_Frontend` e execute:

```bash
npm install
npm run dev
```

Acesse o endereço apresentado pelo Vite. Normalmente:

`http://localhost:5173/login.html`

### 3. Executar o front-end pelo Spring Boot

Para compilar o front-end e copiá-lo para a pasta estática do back-end, execute na pasta `Ferragista_Frontend`:

```bash
npm run deploy:backend
```

Depois, inicie o back-end pelo IntelliJ ou pelo Maven. Acesse:

`http://localhost:8080/login.html`

Esse modo também é utilizado para testar a interface servida pelo Spring Boot.

## Credenciais de demonstração

Em uma base nova, o back-end cria usuários de exemplo:

| Perfil | Usuário | Senha |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Vendedor | `vendedor` | `vendedor123` |

## Executar os testes automatizados

Os testes ficam em `Ferragista_Backend/src/test/java/com/ferragista`, separados por tipo:

- `unit`: testes unitários com JUnit.
- `api`: testes de API com REST-assured.
- `e2e`: testes de interface com Selenium.

Pelo IntelliJ IDEA:

1. Abra a janela **Maven**.
2. Expanda **Ferragista_Backend > Lifecycle**.
3. Execute **test**.

Se o Maven estiver instalado, também é possível executar no terminal, dentro de `Ferragista_Backend`:

```bash
mvn test
```

Os testes Selenium abrem o Google Chrome. Na primeira execução, o Selenium Manager pode precisar de internet para obter o driver compatível.
## Banco de dados

O projeto utiliza H2, um banco de dados relacional. A configuração atual utiliza banco em memória; assim, os dados cadastrados são reiniciados quando a aplicação é encerrada.

O inicializador do sistema cadastra dados de demonstração quando as tabelas correspondentes estão vazias.

## Principais funcionalidades

- Login e autenticação de usuários.
- Cadastro, consulta, edição e exclusão de produtos.
- Gerenciamento de fornecedores, clientes e usuários.
- Registro de vendas com itens e formas de pagamento.
- Atualização automática do estoque após uma venda.
- Histórico, consulta e cancelamento de vendas, com estorno do estoque.

## Repositório

[GitHub — Ferragista Café com Leite](https://github.com/Andre-L-F/Ferragista-Cafe-com-Leite)

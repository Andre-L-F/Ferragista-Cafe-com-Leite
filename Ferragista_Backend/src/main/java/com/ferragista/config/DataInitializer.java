package com.ferragista.config;

import com.ferragista.model.*;
import com.ferragista.model.enums.FormaPagamento;
import com.ferragista.model.enums.PerfilUsuario;
import com.ferragista.model.enums.StatusVenda;
import com.ferragista.repository.*;
import com.ferragista.util.PasswordUtils;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final VendaRepository vendaRepository;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           FornecedorRepository fornecedorRepository,
                           ProdutoRepository produtoRepository,
                           ClienteRepository clienteRepository,
                           VendaRepository vendaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
        this.vendaRepository = vendaRepository;
    }

    @Override
    public void run(String... args) {
        inicializarUsuarios();
        inicializarFornecedoresEProdutos();
        inicializarClientesEVendas();
    }

    private void inicializarUsuarios() {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setNome("Administrador Ferragista");
            admin.setEmail("admin@ferragista.com");
            admin.setUsername("admin");
            admin.setSenha(PasswordUtils.hashPassword("admin123"));
            admin.setPerfil(PerfilUsuario.ADMIN);
            admin.setAtivo(true);
            usuarioRepository.save(admin);

            Usuario vendedor = new Usuario();
            vendedor.setNome("João Vendedor");
            vendedor.setEmail("vendedor@ferragista.com");
            vendedor.setUsername("vendedor");
            vendedor.setSenha(PasswordUtils.hashPassword("vendedor123"));
            vendedor.setPerfil(PerfilUsuario.VENDEDOR);
            vendedor.setAtivo(true);
            usuarioRepository.save(vendedor);

            System.out.println(">>> [DataInitializer] Usuários 'admin' e 'vendedor' criados com sucesso.");
        }
    }

    private void inicializarFornecedoresEProdutos() {
        if (fornecedorRepository.count() == 0) {
            Fornecedor vonder = fornecedorRepository.save(new Fornecedor(
                    null,
                    "OVD Importadora e Distribuidora Ltda (Vonder)",
                    "Vonder Ferramentas",
                    "07.693.811/0001-00",
                    "(41) 2101-1000",
                    "contato@vonder.com.br",
                    "Curitiba",
                    "PR"
            ));

            Fornecedor tigre = fornecedorRepository.save(new Fornecedor(
                    null,
                    "Tigre Materiais de Construção S.A.",
                    "Tigre Tubos e Conexões",
                    "84.684.444/0001-80",
                    "(47) 3441-5000",
                    "vendas@tigre.com.br",
                    "Joinville",
                    "SC"
            ));

            Fornecedor suvinil = fornecedorRepository.save(new Fornecedor(
                    null,
                    "BASF S.A. - Divisão Tintas Suvinil",
                    "Tintas Suvinil",
                    "48.539.407/0001-18",
                    "(11) 3146-4000",
                    "suporte@suvinil.com.br",
                    "São Bernardo do Campo",
                    "SP"
            ));

            Fornecedor gerdau = fornecedorRepository.save(new Fornecedor(
                    null,
                    "Gerdau Aços Longos S.A.",
                    "Gerdau Ferragens",
                    "07.358.761/0001-69",
                    "(11) 3094-6600",
                    "comercial@gerdau.com.br",
                    "São Paulo",
                    "SP"
            ));

            // Cadastrando Produtos da Ferragista
            Produto p1 = new Produto(
                    null,
                    "Furadeira de Impacto 650W 1/2 Pol.",
                    "Mandril de 13mm, velocidade variável e reversível",
                    new BigDecimal("289.90"),
                    "Ferramentas Elétricas",
                    20,
                    "UN",
                    null,
                    "7893946011122",
                    vonder
            );

            Produto p2 = new Produto(
                    null,
                    "Jogo de Chaves de Fenda e Phillips 6 Peças",
                    "Haste em cromo vanádio, cabo anatômico",
                    new BigDecimal("49.90"),
                    "Ferramentas Manuais",
                    35,
                    "UN",
                    null,
                    "7893946022334",
                    vonder
            );

            Produto p3 = new Produto(
                    null,
                    "Tubo PVC Soldável 25mm x 3m",
                    "Tubo para água fria predial",
                    new BigDecimal("18.50"),
                    "Hidráulica",
                    80,
                    "UN",
                    null,
                    "7891334033445",
                    tigre
            );

            Produto p4 = new Produto(
                    null,
                    "Tinta Acrílica Fosca Branco Neve 18L",
                    "Alta cobertura e resistência à lavagem",
                    new BigDecimal("349.00"),
                    "Pintura",
                    12,
                    "LATA",
                    LocalDate.of(2027, 12, 31),
                    "7891445044556",
                    suvinil
            );

            Produto p5 = new Produto(
                    null,
                    "Silicone Acético Transparente 280g",
                    "Selante antifungo para vedações e pias",
                    new BigDecimal("24.90"),
                    "Químicos e Colas",
                    40,
                    "UN",
                    LocalDate.of(2027, 6, 30),
                    "7891556055667",
                    suvinil
            );

            Produto p6 = new Produto(
                    null,
                    "Caixa de Pregos de Aço com Cabeça 17x27 1kg",
                    "Prego polido para marcenaria e construção",
                    new BigDecimal("22.00"),
                    "Fixação",
                    60,
                    "KG",
                    null,
                    "7891667066778",
                    gerdau
            );

            produtoRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));
            System.out.println(">>> [DataInitializer] Fornecedores e Produtos da ferragista carregados.");
        }
    }

    private void inicializarClientesEVendas() {
        if (clienteRepository.count() == 0) {
            Cliente c1 = clienteRepository.save(new Cliente(
                    null,
                    "Carlos Eduardo da Silva",
                    "111.222.333-44",
                    "(62) 98111-2233",
                    "carlos.silva@email.com",
                    "Rua 10, Qd 25, Lt 14, Centro",
                    "Goiânia"
            ));

            clienteRepository.save(new Cliente(
                    null,
                    "Maria Fernanda Souza",
                    "555.666.777-88",
                    "(62) 99222-4455",
                    "maria.souza@email.com",
                    "Av. T-63, Edifício Horizonte",
                    "Goiânia"
            ));

            // Venda de Exemplo
            if (vendaRepository.count() == 0) {
                Produto produtoFuradeira = produtoRepository.findAll().get(0);
                Produto produtoChaves = produtoRepository.findAll().get(1);

                Venda venda = new Venda();
                venda.setNomeCliente(c1.getNome());
                venda.setCpfCliente(c1.getCpf());
                venda.setFormaPagamento(FormaPagamento.CARTAO_CREDITO);
                venda.setObservacoes("Venda inicial de balcão para canteiro de obras");
                venda.setStatus(StatusVenda.FINALIZADA);

                ItemVenda item1 = new ItemVenda();
                item1.setProduto(produtoFuradeira);
                item1.setQuantidade(1);
                item1.setPrecoUnitario(produtoFuradeira.getPreco());
                item1.calcularSubtotal();
                venda.adicionarItem(item1);

                ItemVenda item2 = new ItemVenda();
                item2.setProduto(produtoChaves);
                item2.setQuantidade(2);
                item2.setPrecoUnitario(produtoChaves.getPreco());
                item2.calcularSubtotal();
                venda.adicionarItem(item2);

                venda.calcularTotal();
                vendaRepository.save(venda);
                System.out.println(">>> [DataInitializer] Venda de teste cadastrada com sucesso.");
            }
        }
    }
}

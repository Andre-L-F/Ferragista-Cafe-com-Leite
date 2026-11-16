package com.ferragista;

import com.ferragista.dto.LoginRequestDTO;
import com.ferragista.dto.LoginResponseDTO;
import com.ferragista.model.Produto;
import com.ferragista.repository.ProdutoRepository;
import com.ferragista.repository.UsuarioRepository;
import com.ferragista.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FerragistaBackendApplicationTests {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Contexto carrega e dados iniciais são populados")
    void contextLoads() {
        assertTrue(usuarioRepository.count() > 0, "Deve haver usuários pré-cadastrados");
        assertTrue(produtoRepository.count() > 0, "Deve haver produtos pré-cadastrados");
    }

    @Test
    @DisplayName("Autenticação com admin deve gerar token válido")
    void testeLoginAdminSucesso() {
        LoginRequestDTO req = new LoginRequestDTO("admin", "admin123");
        LoginResponseDTO res = authService.autenticar(req);

        assertNotNull(res);
        assertNotNull(res.getToken());
        assertEquals("admin", res.getUsername());
    }

    @Test
    @DisplayName("Produtos de ferragista devem ter no mínimo 5 atributos preenchidos")
    void testeAtributosProduto() {
        List<Produto> produtos = produtoRepository.findAll();
        assertFalse(produtos.isEmpty());

        Produto p = produtos.get(0);
        assertNotNull(p.getId());
        assertNotNull(p.getNome());
        assertNotNull(p.getPreco());
        assertNotNull(p.getCategoria());
        assertNotNull(p.getQuantidadeEstoque());
        assertNotNull(p.getUnidadeMedida());
    }
}

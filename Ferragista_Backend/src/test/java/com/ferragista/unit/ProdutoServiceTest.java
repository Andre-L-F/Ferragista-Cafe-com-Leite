package com.ferragista.unit;

import com.ferragista.exception.BusinessException;
import com.ferragista.exception.ResourceNotFoundException;
import com.ferragista.model.Produto;
import com.ferragista.repository.FornecedorRepository;
import com.ferragista.repository.ProdutoRepository;
import com.ferragista.service.ProdutoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * TESTES UNITÁRIOS (JUnit 5 + Mockito) - Regras de estoque do ProdutoService.
 * Os repositórios são "mockados": nenhum banco de dados é utilizado.
 */
@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;
    @Mock
    private FornecedorRepository fornecedorRepository;

    private ProdutoService service;
    private Produto martelo;

    @BeforeEach
    void setUp() {
        service = new ProdutoService(produtoRepository, fornecedorRepository);
        martelo = new Produto(1L, "Martelo de Unha", "Cabo de fibra", new BigDecimal("49.90"),
                "Ferramentas Manuais", 10, "UN", null, "7891234567890", null);
    }

    @Test
    @DisplayName("debitarEstoque reduz a quantidade e salva o produto")
    void debitarEstoqueReduzQuantidade() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(martelo));

        service.debitarEstoque(1L, 4);

        assertEquals(6, martelo.getQuantidadeEstoque());
        verify(produtoRepository).save(martelo);
    }

    @Test
    @DisplayName("debitarEstoque com quantidade maior que o estoque lança BusinessException e não salva")
    void debitarEstoqueInsuficienteLancaExcecao() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(martelo));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.debitarEstoque(1L, 11));

        assertTrue(ex.getMessage().contains("Estoque insuficiente"));
        assertEquals(10, martelo.getQuantidadeEstoque(), "Estoque não pode ser alterado");
        verify(produtoRepository, never()).save(any());
    }

    @Test
    @DisplayName("estornarEstoque devolve a quantidade ao estoque")
    void estornarEstoqueSomaQuantidade() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(martelo));

        service.estornarEstoque(1L, 5);

        assertEquals(15, martelo.getQuantidadeEstoque());
        verify(produtoRepository).save(martelo);
    }

    @Test
    @DisplayName("buscarPorId com ID inexistente lança ResourceNotFoundException")
    void buscarPorIdInexistenteLancaExcecao() {
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> service.buscarPorId(99L));

        assertTrue(ex.getMessage().contains("99"));
    }
}

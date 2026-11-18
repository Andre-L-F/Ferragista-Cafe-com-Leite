package com.ferragista.unit;

import com.ferragista.dto.ItemVendaDTO;
import com.ferragista.dto.VendaDTO;
import com.ferragista.exception.BusinessException;
import com.ferragista.model.ItemVenda;
import com.ferragista.model.Produto;
import com.ferragista.model.Venda;
import com.ferragista.model.enums.FormaPagamento;
import com.ferragista.model.enums.StatusVenda;
import com.ferragista.repository.VendaRepository;
import com.ferragista.service.ProdutoService;
import com.ferragista.service.VendaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendaServiceTest {

    @Mock
    private VendaRepository vendaRepository;
    @Mock
    private ProdutoService produtoService;

    private VendaService service;
    private Produto martelo;
    private Produto parafuso;

    @BeforeEach
    void setUp() {
        service = new VendaService(vendaRepository, produtoService);
        martelo = new Produto(1L, "Martelo", null, new BigDecimal("50.00"), "Ferramentas", 10, "UN", null, null, null);
        parafuso = new Produto(2L, "Parafuso", null, new BigDecimal("0.50"), "Fixação", 500, "UN", null, null, null);
    }

    private VendaDTO vendaDTO(ItemVendaDTO... itens) {
        VendaDTO dto = new VendaDTO();
        dto.setNomeCliente("Roberto Carlos");
        dto.setFormaPagamento(FormaPagamento.PIX);
        dto.setItens(List.of(itens));
        return dto;
    }

    private ItemVendaDTO item(Long produtoId, int quantidade) {
        ItemVendaDTO i = new ItemVendaDTO();
        i.setProdutoId(produtoId);
        i.setQuantidade(quantidade);
        return i;
    }

    @Test
    @DisplayName("realizarVenda calcula o total correto e dá baixa no estoque de cada item")
    void realizarVendaCalculaTotalEDebitaEstoque() {
        when(produtoService.buscarPorId(1L)).thenReturn(martelo);
        when(produtoService.buscarPorId(2L)).thenReturn(parafuso);
        when(vendaRepository.save(any(Venda.class))).thenAnswer(inv -> inv.getArgument(0));

        // 2 x 50,00 + 10 x 0,50 = 105,00
        Venda venda = service.realizarVenda(vendaDTO(item(1L, 2), item(2L, 10)));

        assertEquals(StatusVenda.FINALIZADA, venda.getStatus());
        assertEquals(2, venda.getItens().size());
        assertEquals(0, new BigDecimal("105.00").compareTo(venda.getValorTotal()));
        verify(produtoService).debitarEstoque(1L, 2);
        verify(produtoService).debitarEstoque(2L, 10);
    }

    @Test
    @DisplayName("realizarVenda sem itens lança BusinessException e não persiste nada")
    void realizarVendaSemItensLancaExcecao() {
        VendaDTO dto = vendaDTO();

        BusinessException ex = assertThrows(BusinessException.class, () -> service.realizarVenda(dto));

        assertTrue(ex.getMessage().contains("pelo menos um item"));
        verify(vendaRepository, never()).save(any());
        verifyNoInteractions(produtoService);
    }

    @Test
    @DisplayName("cancelarVenda estorna o estoque e muda o status para CANCELADA")
    void cancelarVendaEstornaEstoque() {
        Venda venda = new Venda(1L, "Cliente", null, FormaPagamento.DINHEIRO, null);
        ItemVenda it = new ItemVenda(null, venda, martelo, 3, martelo.getPreco());
        it.calcularSubtotal();
        venda.adicionarItem(it);

        when(vendaRepository.findById(1L)).thenReturn(Optional.of(venda));
        when(vendaRepository.save(any(Venda.class))).thenAnswer(inv -> inv.getArgument(0));

        Venda cancelada = service.cancelarVenda(1L);

        assertEquals(StatusVenda.CANCELADA, cancelada.getStatus());
        verify(produtoService).estornarEstoque(1L, 3);
    }

    @Test
    @DisplayName("cancelarVenda numa venda já cancelada lança BusinessException (sem estornar duas vezes)")
    void cancelarVendaJaCanceladaLancaExcecao() {
        Venda venda = new Venda(1L, "Cliente", null, FormaPagamento.DINHEIRO, null);
        venda.setStatus(StatusVenda.CANCELADA);
        when(vendaRepository.findById(1L)).thenReturn(Optional.of(venda));

        assertThrows(BusinessException.class, () -> service.cancelarVenda(1L));

        verify(produtoService, never()).estornarEstoque(anyLong(), anyInt());
    }
}

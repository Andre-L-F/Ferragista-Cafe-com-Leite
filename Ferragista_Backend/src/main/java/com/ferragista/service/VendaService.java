package com.ferragista.service;

import com.ferragista.dto.ItemVendaDTO;
import com.ferragista.dto.VendaDTO;
import com.ferragista.exception.BusinessException;
import com.ferragista.exception.ResourceNotFoundException;
import com.ferragista.model.ItemVenda;
import com.ferragista.model.Produto;
import com.ferragista.model.Venda;
import com.ferragista.model.enums.StatusVenda;
import com.ferragista.repository.VendaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ProdutoService produtoService;

    public VendaService(VendaRepository vendaRepository, ProdutoService produtoService) {
        this.vendaRepository = vendaRepository;
        this.produtoService = produtoService;
    }

    public List<Venda> listar(StatusVenda status) {
        if (status != null) {
            return vendaRepository.findByStatus(status);
        }
        return vendaRepository.findAll();
    }

    public Venda buscarPorId(Long id) {
        return vendaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venda com ID " + id + " não encontrada"));
    }

    @Transactional
    public Venda realizarVenda(VendaDTO dto) {
        if (dto.getItens() == null || dto.getItens().isEmpty()) {
            throw new BusinessException("A venda precisa ter pelo menos um item");
        }

        Venda venda = new Venda();
        venda.setNomeCliente(dto.getNomeCliente());
        venda.setCpfCliente(dto.getCpfCliente());
        venda.setFormaPagamento(dto.getFormaPagamento());
        venda.setObservacoes(dto.getObservacoes());
        venda.setStatus(StatusVenda.FINALIZADA);

        for (ItemVendaDTO itemDTO : dto.getItens()) {
            Produto produto = produtoService.buscarPorId(itemDTO.getProdutoId());

            // Realiza a baixa no estoque do produto
            produtoService.debitarEstoque(produto.getId(), itemDTO.getQuantidade());

            ItemVenda item = new ItemVenda();
            item.setProduto(produto);
            item.setQuantidade(itemDTO.getQuantidade());
            item.setPrecoUnitario(produto.getPreco());
            item.calcularSubtotal();

            venda.adicionarItem(item);
        }

        venda.calcularTotal();
        return vendaRepository.save(venda);
    }

    @Transactional
    public Venda cancelarVenda(Long id) {
        Venda venda = buscarPorId(id);

        if (venda.getStatus() == StatusVenda.CANCELADA) {
            throw new BusinessException("Esta venda já se encontra cancelada");
        }

        // Estorna produtos de volta ao estoque
        for (ItemVenda item : venda.getItens()) {
            produtoService.estornarEstoque(item.getProduto().getId(), item.getQuantidade());
        }

        venda.setStatus(StatusVenda.CANCELADA);
        return vendaRepository.save(venda);
    }

    @Transactional
    public void deletar(Long id) {
        Venda venda = buscarPorId(id);

        // Se deletar uma venda finalizada, estorna estoque
        if (venda.getStatus() == StatusVenda.FINALIZADA) {
            for (ItemVenda item : venda.getItens()) {
                produtoService.estornarEstoque(item.getProduto().getId(), item.getQuantidade());
            }
        }

        vendaRepository.delete(venda);
    }
}

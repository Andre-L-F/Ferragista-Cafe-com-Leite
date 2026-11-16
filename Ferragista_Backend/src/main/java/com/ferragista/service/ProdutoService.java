package com.ferragista.service;

import com.ferragista.dto.ProdutoDTO;
import com.ferragista.exception.BusinessException;
import com.ferragista.exception.ResourceNotFoundException;
import com.ferragista.model.Fornecedor;
import com.ferragista.model.Produto;
import com.ferragista.repository.FornecedorRepository;
import com.ferragista.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;

    public ProdutoService(ProdutoRepository produtoRepository, FornecedorRepository fornecedorRepository) {
        this.produtoRepository = produtoRepository;
        this.fornecedorRepository = fornecedorRepository;
    }

    public List<Produto> listar(String busca, String categoria) {
        if (busca != null && !busca.isBlank()) {
            return produtoRepository.findByNomeContainingIgnoreCase(busca);
        }
        if (categoria != null && !categoria.isBlank()) {
            return produtoRepository.findByCategoriaIgnoreCase(categoria);
        }
        return produtoRepository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto com ID " + id + " não encontrado"));
    }

    @Transactional
    public Produto criar(ProdutoDTO dto) {
        Produto produto = new Produto();
        preencherDados(produto, dto);
        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto atualizar(Long id, ProdutoDTO dto) {
        Produto produto = buscarPorId(id);
        preencherDados(produto, dto);
        return produtoRepository.save(produto);
    }

    @Transactional
    public void deletar(Long id) {
        Produto produto = buscarPorId(id);
        produtoRepository.delete(produto);
    }

    @Transactional
    public void debitarEstoque(Long produtoId, int quantidade) {
        Produto produto = buscarPorId(produtoId);
        if (produto.getQuantidadeEstoque() < quantidade) {
            throw new BusinessException("Estoque insuficiente para o produto '" + produto.getNome() +
                    "'. Disponível: " + produto.getQuantidadeEstoque() + ", Solicitado: " + quantidade);
        }
        produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - quantidade);
        produtoRepository.save(produto);
    }

    @Transactional
    public void estornarEstoque(Long produtoId, int quantidade) {
        Produto produto = buscarPorId(produtoId);
        produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() + quantidade);
        produtoRepository.save(produto);
    }

    private void preencherDados(Produto produto, ProdutoDTO dto) {
        produto.setNome(dto.getNome());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setCategoria(dto.getCategoria());
        produto.setQuantidadeEstoque(dto.getQuantidadeEstoque());
        produto.setUnidadeMedida(dto.getUnidadeMedida() != null && !dto.getUnidadeMedida().isBlank() ? dto.getUnidadeMedida() : "UN");
        produto.setDataValidade(dto.getDataValidade());
        produto.setCodigoBarras(dto.getCodigoBarras());

        if (dto.getFornecedorId() != null) {
            Fornecedor fornecedor = fornecedorRepository.findById(dto.getFornecedorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fornecedor com ID " + dto.getFornecedorId() + " não encontrado"));
            produto.setFornecedor(fornecedor);
        } else {
            produto.setFornecedor(null);
        }
    }
}

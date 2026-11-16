package com.ferragista.repository;

import com.ferragista.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByCategoriaIgnoreCase(String categoria);
    List<Produto> findByNomeContainingIgnoreCase(String termo);
    List<Produto> findByQuantidadeEstoqueLessThanEqual(Integer estoqueMinimo);
    List<Produto> findByFornecedorId(Long fornecedorId);
}

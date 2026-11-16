package com.ferragista.repository;

import com.ferragista.model.Venda;
import com.ferragista.model.enums.StatusVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {
    List<Venda> findByStatus(StatusVenda status);
    List<Venda> findByCpfCliente(String cpfCliente);
    List<Venda> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);
}

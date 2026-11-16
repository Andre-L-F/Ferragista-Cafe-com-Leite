package com.ferragista.model;

import com.ferragista.model.enums.FormaPagamento;
import com.ferragista.model.enums.StatusVenda;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendas")
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

    @NotBlank(message = "O nome do cliente é obrigatório")
    @Column(name = "nome_cliente", nullable = false, length = 120)
    private String nomeCliente;

    @Column(name = "cpf_cliente", length = 20)
    private String cpfCliente;

    @NotNull(message = "A forma de pagamento é obrigatória")
    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", nullable = false, length = 30)
    private FormaPagamento formaPagamento;

    @NotNull
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusVenda status = StatusVenda.FINALIZADA;

    @Column(length = 255)
    private String observacoes;

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ItemVenda> itens = new ArrayList<>();

    public Venda() {
    }

    public Venda(Long id, String nomeCliente, String cpfCliente, FormaPagamento formaPagamento, String observacoes) {
        this.id = id;
        this.nomeCliente = nomeCliente;
        this.cpfCliente = cpfCliente;
        this.formaPagamento = formaPagamento;
        this.observacoes = observacoes;
        this.dataHora = LocalDateTime.now();
        this.status = StatusVenda.FINALIZADA;
        this.valorTotal = BigDecimal.ZERO;
    }

    @PrePersist
    public void prePersist() {
        if (this.dataHora == null) {
            this.dataHora = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusVenda.FINALIZADA;
        }
        calcularTotal();
    }

    public void adicionarItem(ItemVenda item) {
        itens.add(item);
        item.setVenda(this);
        calcularTotal();
    }

    public void removerItem(ItemVenda item) {
        itens.remove(item);
        item.setVenda(null);
        calcularTotal();
    }

    public void calcularTotal() {
        BigDecimal total = BigDecimal.ZERO;
        if (itens != null) {
            for (ItemVenda item : itens) {
                if (item.getSubtotal() != null) {
                    total = total.add(item.getSubtotal());
                }
            }
        }
        this.valorTotal = total;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public String getCpfCliente() {
        return cpfCliente;
    }

    public void setCpfCliente(String cpfCliente) {
        this.cpfCliente = cpfCliente;
    }

    public FormaPagamento getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(FormaPagamento formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public StatusVenda getStatus() {
        return status;
    }

    public void setStatus(StatusVenda status) {
        this.status = status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public List<ItemVenda> getItens() {
        return itens;
    }

    public void setItens(List<ItemVenda> itens) {
        this.itens = itens;
        if (itens != null) {
            itens.forEach(it -> it.setVenda(this));
        }
        calcularTotal();
    }
}

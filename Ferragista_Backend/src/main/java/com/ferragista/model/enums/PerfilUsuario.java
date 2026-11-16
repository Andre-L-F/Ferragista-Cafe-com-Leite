package com.ferragista.model.enums;

public enum PerfilUsuario {
    ADMIN("Administrador"),
    VENDEDOR("Vendedor");

    private final String descricao;

    PerfilUsuario(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}

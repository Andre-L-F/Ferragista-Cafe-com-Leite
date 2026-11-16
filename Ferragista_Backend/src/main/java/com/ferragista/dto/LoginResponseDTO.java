package com.ferragista.dto;

import com.ferragista.model.enums.PerfilUsuario;

public class LoginResponseDTO {

    private String token;
    private Long id;
    private String nome;
    private String username;
    private String email;
    private PerfilUsuario perfil;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(String token, Long id, String nome, String username, String email, PerfilUsuario perfil) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.username = username;
        this.email = email;
        this.perfil = perfil;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public PerfilUsuario getPerfil() {
        return perfil;
    }

    public void setPerfil(PerfilUsuario perfil) {
        this.perfil = perfil;
    }
}

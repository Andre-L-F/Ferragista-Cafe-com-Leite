package com.ferragista.service;

import com.ferragista.dto.LoginRequestDTO;
import com.ferragista.dto.LoginResponseDTO;
import com.ferragista.exception.BusinessException;
import com.ferragista.exception.UnauthorizedException;
import com.ferragista.model.Usuario;
import com.ferragista.repository.UsuarioRepository;
import com.ferragista.util.PasswordUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    // Gerenciamento de sessões/tokens em memória
    private static final Map<String, TokenSession> ACTIVE_SESSIONS = new ConcurrentHashMap<>();
    private static final long TOKEN_VALIDITY_HOURS = 24;

    public static class TokenSession {
        private final Long usuarioId;
        private final String username;
        private final LocalDateTime expiresAt;

        public TokenSession(Long usuarioId, String username, LocalDateTime expiresAt) {
            this.usuarioId = usuarioId;
            this.username = username;
            this.expiresAt = expiresAt;
        }

        public Long getUsuarioId() {
            return usuarioId;
        }

        public String getUsername() {
            return username;
        }

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponseDTO autenticar(LoginRequestDTO request) {
        if (request.getLogin() == null || request.getLogin().isBlank()) {
            throw new BusinessException("Informe o usuário ou e-mail");
        }
        if (request.getSenha() == null || request.getSenha().isBlank()) {
            throw new BusinessException("Informe a senha");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsernameOrEmail(request.getLogin(), request.getLogin());
        if (usuarioOpt.isEmpty()) {
            throw new UnauthorizedException("Usuário ou senha inválidos");
        }

        Usuario usuario = usuarioOpt.get();

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new UnauthorizedException("Usuário desativado no sistema");
        }

        boolean senhaCorreta = PasswordUtils.checkPassword(request.getSenha(), usuario.getSenha());
        if (!senhaCorreta) {
            throw new UnauthorizedException("Usuário ou senha inválidos");
        }

        // Gera token seguro
        String token = UUID.randomUUID().toString().replace("-", "") + System.currentTimeMillis();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(TOKEN_VALIDITY_HOURS);
        ACTIVE_SESSIONS.put(token, new TokenSession(usuario.getId(), usuario.getUsername(), expiresAt));

        return new LoginResponseDTO(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getPerfil()
        );
    }

    public Usuario validarToken(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Token de autenticação não fornecido");
        }

        // Remove prefixo "Bearer " caso presente
        if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
            token = token.substring(7).trim();
        }

        TokenSession session = ACTIVE_SESSIONS.get(token);
        if (session == null || session.isExpired()) {
            if (session != null) {
                ACTIVE_SESSIONS.remove(token);
            }
            throw new UnauthorizedException("Sessão expirada ou token inválido. Faça login novamente.");
        }

        return usuarioRepository.findById(session.getUsuarioId())
                .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado"));
    }

    public void logout(String token) {
        if (token != null) {
            if (token.startsWith("Bearer ") || token.startsWith("bearer ")) {
                token = token.substring(7).trim();
            }
            ACTIVE_SESSIONS.remove(token);
        }
    }
}

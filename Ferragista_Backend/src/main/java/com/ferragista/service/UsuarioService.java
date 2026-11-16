package com.ferragista.service;

import com.ferragista.dto.UsuarioDTO;
import com.ferragista.exception.BusinessException;
import com.ferragista.exception.ResourceNotFoundException;
import com.ferragista.model.Usuario;
import com.ferragista.model.enums.PerfilUsuario;
import com.ferragista.repository.UsuarioRepository;
import com.ferragista.util.PasswordUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioDTO::new)
                .collect(Collectors.toList());
    }

    public UsuarioDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com ID " + id + " não encontrado"));
        return new UsuarioDTO(usuario);
    }

    @Transactional
    public UsuarioDTO criar(UsuarioDTO dto) {
        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            throw new BusinessException("Username é obrigatório");
        }
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new BusinessException("E-mail é obrigatório");
        }
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new BusinessException("A senha é obrigatória para cadastrar o usuário");
        }
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new BusinessException("O username '" + dto.getUsername() + "' já está em uso");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("O e-mail '" + dto.getEmail() + "' já está em uso");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setUsername(dto.getUsername());
        usuario.setSenha(PasswordUtils.hashPassword(dto.getSenha()));
        usuario.setPerfil(dto.getPerfil() != null ? dto.getPerfil() : PerfilUsuario.VENDEDOR);
        usuario.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        Usuario salvo = usuarioRepository.save(usuario);
        return new UsuarioDTO(salvo);
    }

    @Transactional
    public UsuarioDTO atualizar(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com ID " + id + " não encontrado"));

        if (dto.getNome() != null && !dto.getNome().isBlank()) {
            usuario.setNome(dto.getNome());
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank() && !dto.getEmail().equals(usuario.getEmail())) {
            if (usuarioRepository.existsByEmail(dto.getEmail())) {
                throw new BusinessException("O e-mail '" + dto.getEmail() + "' já está em uso por outro usuário");
            }
            usuario.setEmail(dto.getEmail());
        }

        if (dto.getUsername() != null && !dto.getUsername().isBlank() && !dto.getUsername().equals(usuario.getUsername())) {
            if (usuarioRepository.existsByUsername(dto.getUsername())) {
                throw new BusinessException("O username '" + dto.getUsername() + "' já está em uso por outro usuário");
            }
            usuario.setUsername(dto.getUsername());
        }

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(PasswordUtils.hashPassword(dto.getSenha()));
        }

        if (dto.getPerfil() != null) {
            usuario.setPerfil(dto.getPerfil());
        }

        if (dto.getAtivo() != null) {
            usuario.setAtivo(dto.getAtivo());
        }

        Usuario atualizado = usuarioRepository.save(usuario);
        return new UsuarioDTO(atualizado);
    }

    @Transactional
    public void deletar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com ID " + id + " não encontrado"));
        usuarioRepository.delete(usuario);
    }
}

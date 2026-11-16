package com.ferragista.controller;

import com.ferragista.dto.LoginRequestDTO;
import com.ferragista.dto.LoginResponseDTO;
import com.ferragista.dto.UsuarioDTO;
import com.ferragista.model.Usuario;
import com.ferragista.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.autenticar(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logout efetuado com sucesso"));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getUsuarioLogado(@RequestHeader(value = "Authorization", required = false) String token) {
        Usuario usuario = authService.validarToken(token);
        return ResponseEntity.ok(new UsuarioDTO(usuario));
    }
}

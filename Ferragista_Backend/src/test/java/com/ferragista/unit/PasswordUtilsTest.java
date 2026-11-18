package com.ferragista.unit;

import com.ferragista.util.PasswordUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;


class PasswordUtilsTest {

    @Test
    @DisplayName("Hash deve ser determinístico e nunca igual à senha em texto puro")
    void hashDeveSerDeterministicoENaoExporSenha() {
        String hash1 = PasswordUtils.hashPassword("admin123");
        String hash2 = PasswordUtils.hashPassword("admin123");

        assertEquals(hash1, hash2);
        assertNotEquals("admin123", hash1);
        assertEquals(64, hash1.length(), "SHA-256 em hexadecimal tem 64 caracteres");
    }

    @Test
    @DisplayName("checkPassword aceita a senha correta e rejeita a incorreta")
    void checkPasswordValidaSenha() {
        String hash = PasswordUtils.hashPassword("vendedor123");

        assertTrue(PasswordUtils.checkPassword("vendedor123", hash));
        assertFalse(PasswordUtils.checkPassword("senhaErrada", hash));
        assertFalse(PasswordUtils.checkPassword(null, hash));
        assertFalse(PasswordUtils.checkPassword("vendedor123", null));
    }

    @Test
    @DisplayName("Senha vazia ou nula deve lançar IllegalArgumentException")
    void senhaVaziaDeveLancarExcecao() {
        assertThrows(IllegalArgumentException.class, () -> PasswordUtils.hashPassword(""));
        assertThrows(IllegalArgumentException.class, () -> PasswordUtils.hashPassword("   "));
        assertThrows(IllegalArgumentException.class, () -> PasswordUtils.hashPassword(null));
    }
}

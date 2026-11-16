package com.ferragista.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public class PasswordUtils {

    private static final String SALT = "Ferragista_Secret_Salt_2026!";

    public static String hashPassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("A senha não pode ser vazia");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String salted = SALT + password + SALT;
            byte[] hash = digest.digest(salted.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao calcular hash de senha", e);
        }
    }

    public static boolean checkPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        String computed = hashPassword(plainPassword);
        return computed.equalsIgnoreCase(hashedPassword);
    }
}

package com.ferragista.api;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
class AuthApiTest extends ApiTestBase {

    @Test
    @DisplayName("POST /api/auth/login com credenciais válidas retorna 200 e um token")
    void loginComCredenciaisValidasRetornaToken() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("login", "admin", "senha", "admin123"))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("token", not(emptyOrNullString()))
            .body("username", equalTo("admin"))
            .body("perfil", equalTo("ADMIN"));
    }

    @Test
    @DisplayName("POST /api/auth/login com senha errada retorna 401 e mensagem de erro")
    void loginComSenhaErradaRetorna401() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("login", "admin", "senha", "senha-errada"))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("message", equalTo("Usuário ou senha inválidos"));
    }

    @Test
    @DisplayName("GET /api/auth/me com token válido devolve o usuário logado; sem token retorna 401")
    void meExigeTokenValido() {
        String token = login("vendedor", "vendedor123");

        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .get("/api/auth/me")
        .then()
            .statusCode(200)
            .body("username", equalTo("vendedor"))
            .body("perfil", equalTo("VENDEDOR"));

        given()
        .when()
            .get("/api/auth/me")
        .then()
            .statusCode(401);
    }
}

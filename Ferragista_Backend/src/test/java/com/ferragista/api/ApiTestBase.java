package com.ferragista.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.util.HashMap;
import java.util.Map;

/**
 * Base dos testes de API: sobe a aplicação inteira numa porta aleatória
 * (banco H2 em memória + DataInitializer) e aponta o REST-assured para ela.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class ApiTestBase {

    @LocalServerPort
    protected int port;

    @BeforeEach
    void configurarRestAssured() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
    }

    /** Faz login com o usuário informado e devolve o token Bearer. */
    protected String login(String usuario, String senha) {
        return RestAssured.given()
                .contentType(ContentType.JSON)
                .body(Map.of("login", usuario, "senha", senha))
                .post("/api/auth/login")
                .then().statusCode(200)
                .extract().path("token");
    }

    /** Monta o JSON de um produto válido. */
    protected Map<String, Object> produtoValido(String nome, double preco, int estoque) {
        Map<String, Object> produto = new HashMap<>();
        produto.put("nome", nome);
        produto.put("descricao", "Produto criado pelo teste automatizado");
        produto.put("preco", preco);
        produto.put("categoria", "Ferramentas Manuais");
        produto.put("quantidadeEstoque", estoque);
        produto.put("unidadeMedida", "UN");
        produto.put("codigoBarras", "7890000000001");
        return produto;
    }
}

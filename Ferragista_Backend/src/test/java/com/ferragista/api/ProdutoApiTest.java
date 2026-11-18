package com.ferragista.api;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

class ProdutoApiTest extends ApiTestBase {

    @Test
    @DisplayName("CRUD completo de produto: criar (201), buscar (200), atualizar (200), excluir (204) e confirmar 404")
    void crudCompletoDeProduto() {
        String token = login("admin", "admin123");

        // CREATE
        int id = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(produtoValido("Chave de Fenda API", 19.90, 30))
            .when()
                .post("/api/produtos")
            .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("nome", equalTo("Chave de Fenda API"))
                .body("quantidadeEstoque", equalTo(30))
                .extract().path("id");

        // READ
        given().when().get("/api/produtos/{id}", id)
            .then().statusCode(200)
                .body("categoria", equalTo("Ferramentas Manuais"))
                .body("preco", equalTo(19.9f));

        // UPDATE
        Map<String, Object> alterado = produtoValido("Chave de Fenda API Premium", 29.90, 25);
        given().contentType(ContentType.JSON).body(alterado)
            .when().put("/api/produtos/{id}", id)
            .then().statusCode(200)
                .body("nome", equalTo("Chave de Fenda API Premium"))
                .body("quantidadeEstoque", equalTo(25));

        // LISTAGEM com filtro
        given().queryParam("busca", "Premium")
            .when().get("/api/produtos")
            .then().statusCode(200)
                .body("nome", hasItem("Chave de Fenda API Premium"));

        // DELETE
        given().when().delete("/api/produtos/{id}", id)
            .then().statusCode(204);

        // Confirma que não existe mais
        given().when().get("/api/produtos/{id}", id)
            .then().statusCode(404)
                .body("message", containsString("não encontrado"));
    }

    @Test
    @DisplayName("POST /api/produtos com dados inválidos retorna 400 com os campos que falharam")
    void criarProdutoInvalidoRetorna400() {
        Map<String, Object> invalido = produtoValido("", -5.0, -1);

        given()
            .contentType(ContentType.JSON)
            .body(invalido)
        .when()
            .post("/api/produtos")
        .then()
            .statusCode(400)
            .body("error", equalTo("Erro de Validação"))
            .body("erros", hasKey("nome"))
            .body("erros", hasKey("preco"))
            .body("erros", hasKey("quantidadeEstoque"));
    }

    @Test
    @DisplayName("Venda dá baixa no estoque; estoque insuficiente retorna 400; cancelar estorna o estoque")
    void fluxoDeVendaMovimentaEstoque() {
        // Produto com 10 unidades a R$ 50,00
        int produtoId = given()
                .contentType(ContentType.JSON)
                .body(produtoValido("Alicate API", 50.00, 10))
            .when().post("/api/produtos")
            .then().statusCode(201)
                .extract().path("id");

        // Venda de 3 unidades => total 150,00 e estoque 7
        Map<String, Object> venda = Map.of(
                "nomeCliente", "Cliente Teste API",
                "formaPagamento", "PIX",
                "itens", java.util.List.of(Map.of("produtoId", produtoId, "quantidade", 3)));

        int vendaId = given().contentType(ContentType.JSON).body(venda)
            .when().post("/api/vendas")
            .then().statusCode(201)
                .body("status", equalTo("FINALIZADA"))
                .body("valorTotal", equalTo(150.0f))
                .extract().path("id");

        given().when().get("/api/produtos/{id}", produtoId)
            .then().statusCode(200).body("quantidadeEstoque", equalTo(7));

        // Tentar vender mais do que o estoque => 400
        Map<String, Object> vendaExcessiva = Map.of(
                "nomeCliente", "Cliente Teste API",
                "formaPagamento", "DINHEIRO",
                "itens", java.util.List.of(Map.of("produtoId", produtoId, "quantidade", 8)));

        given().contentType(ContentType.JSON).body(vendaExcessiva)
            .when().post("/api/vendas")
            .then().statusCode(400)
                .body("message", containsString("Estoque insuficiente"));

        // Cancelar a venda => estoque volta a 10
        given().when().patch("/api/vendas/{id}/cancelar", vendaId)
            .then().statusCode(200).body("status", equalTo("CANCELADA"));

        given().when().get("/api/produtos/{id}", produtoId)
            .then().statusCode(200).body("quantidadeEstoque", equalTo(10));
    }
}

package com.ferragista.e2e;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TESTES DE INTEGRAÇÃO / E2E (Selenium) - CRUD de Produtos pela interface.
 * Fluxo: login -> cadastrar produto -> editar -> excluir.
 */
class ProdutoE2ETest extends SeleniumTestBase {

    @BeforeEach
    void fazerLogin() {
        driver.get(url("/login.html"));
        driver.findElement(By.id("username")).sendKeys("admin");
        driver.findElement(By.id("password")).sendKeys("admin123");
        driver.findElement(By.id("btnLogin")).click();
        wait.until(ExpectedConditions.urlContains("/index.html"));
        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.id("navUserName"), "Administrador"));
    }

    private void preencher(String id, String valor) {
        WebElement campo = driver.findElement(By.id(id));
        if ("number".equals(campo.getAttribute("type"))) {
            // Evita problemas de separador decimal do idioma do navegador (ponto x vírgula)
            ((JavascriptExecutor) driver).executeScript("arguments[0].value = arguments[1];", campo, valor);
        } else {
            campo.clear();
            campo.sendKeys(valor);
        }
    }

    private By linhaDoProduto(String nome) {
        return By.xpath("//tbody[@id='tabelaProdutos']//tr[contains(., '" + nome + "')]");
    }

    @Test
    @DisplayName("Cadastrar produto pela tela: aparece alerta de sucesso e o produto surge na tabela")
    void cadastrarProdutoPelaInterface() {
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Novo Produto')]"))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("prodNome")));

        preencher("prodNome", "Furadeira E2E 500W");
        preencher("prodDescricao", "Cadastrada pelo Selenium");
        preencher("prodPreco", "289.90");
        preencher("prodCategoria", "Ferramentas Elétricas");
        preencher("prodEstoque", "12");
        driver.findElement(By.xpath("//form[@id='formProduto']//button[@type='submit']")).click();

        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.id("globalAlert"), "cadastrado com sucesso"));

        WebElement linha = wait.until(ExpectedConditions.visibilityOfElementLocated(
                linhaDoProduto("Furadeira E2E 500W")));
        assertTrue(linha.getText().contains("Ferramentas Elétricas"));
        assertTrue(linha.getText().contains("289,90"));
    }

    @Test
    @DisplayName("Editar e excluir produto pela tela: alterações refletem na tabela e a exclusão remove a linha")
    void editarEExcluirProdutoPelaInterface() {
        // Cria o produto
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(., 'Novo Produto')]"))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("prodNome")));
        preencher("prodNome", "Serra Circular E2E");
        preencher("prodPreco", "399.00");
        preencher("prodCategoria", "Ferramentas Elétricas");
        preencher("prodEstoque", "8");
        driver.findElement(By.xpath("//form[@id='formProduto']//button[@type='submit']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(linhaDoProduto("Serra Circular E2E")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("prodNome")));

        // Edita o nome
        driver.findElement(By.xpath(
                "//tbody[@id='tabelaProdutos']//tr[contains(., 'Serra Circular E2E')]//button[contains(., 'Editar')]")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("prodNome")));
        preencher("prodNome", "Serra Circular E2E Editada");
        driver.findElement(By.xpath("//form[@id='formProduto']//button[@type='submit']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(linhaDoProduto("Serra Circular E2E Editada")));

        // Exclui (aceitando o confirm() do navegador)
        driver.findElement(By.xpath(
                "//tbody[@id='tabelaProdutos']//tr[contains(., 'Serra Circular E2E Editada')]//button[contains(@class,'btn-danger')]")).click();
        wait.until(ExpectedConditions.alertIsPresent()).accept();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(linhaDoProduto("Serra Circular E2E Editada")));
        assertTrue(driver.findElements(linhaDoProduto("Serra Circular E2E Editada")).isEmpty());
    }
}

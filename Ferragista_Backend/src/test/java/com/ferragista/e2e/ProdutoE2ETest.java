package com.ferragista.e2e;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

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

    private void acessarTelaDeProdutos() {
        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//a[contains(@href, '#/produtos')]")
        )).click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h1[normalize-space()='Produtos']")
        ));

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(normalize-space(.), 'Novo Produto')]")
        ));
    }

    private void preencher(String id, String valor) {
        WebElement campo = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id(id)));

        if ("number".equals(campo.getAttribute("type"))) {
            ((JavascriptExecutor) driver).executeScript(
                    "const element = arguments[0];" +
                            "const value = arguments[1];" +
                            "const setter = Object.getOwnPropertyDescriptor(" +
                            "window.HTMLInputElement.prototype, 'value').set;" +
                            "setter.call(element, value);" +
                            "element.dispatchEvent(new Event('input', { bubbles: true }));" +
                            "element.dispatchEvent(new Event('change', { bubbles: true }));",
                    campo, valor);
        } else {
            campo.clear();
            campo.sendKeys(valor);
        }
    }

    private void conferirValor(String id, String esperado) {
        WebElement campo = driver.findElement(By.id(id));
        String valorAtual = (String) ((JavascriptExecutor) driver)
                .executeScript("return arguments[0].value;", campo);
        assertNotNull(valorAtual, "O campo " + id + " está sem valor.");
        assertEquals(0, new BigDecimal(esperado).compareTo(new BigDecimal(valorAtual)),
                "O valor do campo " + id + " foi perdido ou alterado antes do envio do formulário.");
    }

    private void aguardarMensagemDeSucesso(String trechoEsperado) {
        wait.until(driver -> {
            WebElement alerta = driver.findElement(By.id("globalAlert"));
            return !alerta.getText().trim().isEmpty();
        });

        String mensagem = driver.findElement(By.id("globalAlert")).getText().trim();
        assertTrue(mensagem.toLowerCase().contains(trechoEsperado.toLowerCase()),
                "A operação não foi confirmada. Mensagem apresentada pela interface: " + mensagem);
    }

    private By linhaDoProduto(String nome) {
        return By.xpath("//tbody[@id='tabelaProdutos']//tr[contains(., '" + nome + "')]");
    }

    @Test
    @DisplayName("Cadastrar produto pela interface: preço é preservado, aparece alerta de sucesso e produto surge na tabela")
    void cadastrarProdutoPelaInterface() {
        acessarTelaDeProdutos();

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(normalize-space(.), 'Novo Produto')]")
        )).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("prodNome")));

        preencher("prodNome", "Furadeira E2E 500W");
        preencher("prodDescricao", "Cadastrada pelo Selenium");
        preencher("prodPreco", "289.90");
        preencher("prodCategoria", "Ferramentas Elétricas");
        preencher("prodEstoque", "12");
        conferirValor("prodPreco", "289.90");
        conferirValor("prodEstoque", "12");

        driver.findElement(By.xpath("//form[@id='formProduto']//button[@type='submit']")).click();

        aguardarMensagemDeSucesso("cadastrado com sucesso");

        WebElement linha = wait.until(ExpectedConditions.visibilityOfElementLocated(
                linhaDoProduto("Furadeira E2E 500W")));
        assertTrue(linha.getText().contains("Ferramentas Elétricas"));
        assertTrue(linha.getText().contains("289,90"));
    }

    @Test
    @DisplayName("Editar e excluir produto pela interface: alterações refletem na tabela e exclusão remove a linha")
    void editarEExcluirProdutoPelaInterface() {
        acessarTelaDeProdutos();

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(normalize-space(.), 'Novo Produto')]")
        )).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("prodNome")));

        preencher("prodNome", "Serra Circular E2E");
        preencher("prodPreco", "399.00");
        preencher("prodCategoria", "Ferramentas Elétricas");
        preencher("prodEstoque", "8");
        conferirValor("prodPreco", "399.00");
        conferirValor("prodEstoque", "8");

        driver.findElement(By.xpath("//form[@id='formProduto']//button[@type='submit']")).click();
        aguardarMensagemDeSucesso("cadastrado com sucesso");

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                linhaDoProduto("Serra Circular E2E")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("prodNome")));

        driver.findElement(By.xpath(
                "//tbody[@id='tabelaProdutos']//tr[contains(., 'Serra Circular E2E')]//button[contains(., 'Editar')]"
        )).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("prodNome")));

        preencher("prodNome", "Serra Circular E2E Editada");
        driver.findElement(By.xpath("//form[@id='formProduto']//button[@type='submit']")).click();
        aguardarMensagemDeSucesso("atualizado com sucesso");

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                linhaDoProduto("Serra Circular E2E Editada")));

        driver.findElement(By.xpath(
                "//tbody[@id='tabelaProdutos']//tr[contains(., 'Serra Circular E2E Editada')]//button[contains(@class,'btn-danger')]"
        )).click();
        wait.until(ExpectedConditions.alertIsPresent()).accept();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(
                linhaDoProduto("Serra Circular E2E Editada")));
        assertTrue(driver.findElements(linhaDoProduto("Serra Circular E2E Editada")).isEmpty());
    }
}

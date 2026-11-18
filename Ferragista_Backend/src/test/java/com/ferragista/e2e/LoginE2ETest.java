package com.ferragista.e2e;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TESTES DE INTEGRAÇÃO / E2E (Selenium) - Tela de Login.
 */
class LoginE2ETest extends SeleniumTestBase {

    @Test
    @DisplayName("Login válido redireciona para o painel e mostra o usuário conectado")
    void loginValidoRedirecionaParaPainel() {
        driver.get(url("/login.html"));

        driver.findElement(By.id("username")).sendKeys("admin");
        driver.findElement(By.id("password")).sendKeys("admin123");
        driver.findElement(By.id("btnLogin")).click();

        wait.until(ExpectedConditions.urlContains("/index.html"));
        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.id("navUserName"), "Administrador Ferragista"));

        assertEquals("ADMIN", driver.findElement(By.id("navUserRole")).getText());
    }

    @Test
    @DisplayName("Login com senha errada mostra mensagem de erro e permanece na tela de login")
    void loginInvalidoMostraErro() {
        driver.get(url("/login.html"));

        driver.findElement(By.id("username")).sendKeys("admin");
        driver.findElement(By.id("password")).sendKeys("senha-errada");
        driver.findElement(By.id("btnLogin")).click();

        wait.until(ExpectedConditions.textToBePresentInElementLocated(
                By.id("loginAlert"), "Usuário ou senha inválidos"));

        assertTrue(driver.getCurrentUrl().contains("/login.html"));
    }

    @Test
    @DisplayName("Acessar o painel sem estar logado redireciona para a tela de login")
    void painelSemLoginRedirecionaParaLogin() {
        driver.get(url("/index.html"));

        wait.until(ExpectedConditions.urlContains("/login.html"));
        assertTrue(driver.findElement(By.id("loginForm")).isDisplayed());
    }
}

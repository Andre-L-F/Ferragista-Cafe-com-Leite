package com.ferragista.e2e;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.time.Duration;

/**
 * Base dos testes E2E: sobe o sistema numa porta aleatória e abre o Chrome.
 *
 * Por padrão o navegador ABRE NA TELA (ideal para gravar o vídeo da entrega).
 * Para rodar sem janela (CI/servidor):  mvn test -Dselenium.headless=true
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class SeleniumTestBase {

    @LocalServerPort
    protected int port;

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeEach
    void abrirNavegador() {
        ChromeOptions options = new ChromeOptions();
        if (Boolean.getBoolean("selenium.headless")) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1366,900", "--no-sandbox", "--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    void fecharNavegador() {
        if (driver != null) {
            driver.quit();
        }
    }

    protected String url(String caminho) {
        return "http://localhost:" + port + caminho;
    }
}

import { copyFile } from 'node:fs/promises';

// O Selenium existente abre /login.html diretamente no servidor Spring Boot.
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../dist/login.html', import.meta.url));

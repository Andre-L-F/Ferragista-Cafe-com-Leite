import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const frontendDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(frontendDir, '..', 'dist');
const backendStaticDir = path.resolve(frontendDir, '..', '..', 'Ferragista_Backend', 'src', 'main', 'resources', 'static');

try {
  await mkdir(backendStaticDir, { recursive: true });
  await rm(backendStaticDir, { recursive: true, force: true });
  await mkdir(backendStaticDir, { recursive: true });
  await cp(distDir, backendStaticDir, { recursive: true });
  console.log(`Front-end compilado copiado para: ${backendStaticDir}`);
} catch (error) {
  console.error('Não foi possível copiar o front-end para o Spring Boot.');
  console.error('Verifique se Ferragista_Frontend e Ferragista_Backend estão lado a lado.');
  console.error(error.message);
  process.exitCode = 1;
}

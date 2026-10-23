import { crearApp } from './app.js';
const port = Number(process.env.PORT ?? 3010);
const host = process.env.HOST ?? '127.0.0.1';
crearApp({ iaUrl: process.env.IA_URL }).listen(port, host, () => {
  console.log(`Backend v1.0: http://${host}:${port}`);
});

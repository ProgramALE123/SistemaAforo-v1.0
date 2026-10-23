import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { crearApp } from '../src/app.js';

const imagen = Buffer.from('imagen de prueba');

test('No permite detectar sin imagen', async () => {
  const response = await request(crearApp()).post('/api/detect/image');
  assert.equal(response.status, 400);
});

test('Rechaza tipos no admitidos antes de invocar la IA', async () => {
  const app = crearApp({ solicitar: () => assert.fail('No debe llamar a IA') });
  const response = await request(app).post('/api/detect/image').attach('file', imagen, 'archivo.txt');
  assert.equal(response.status, 415);
});

test('Rechaza archivos mayores de 8 MB', async () => {
  const response = await request(crearApp()).post('/api/detect/image')
    .attach('file', Buffer.alloc(8*1024*1024+1), 'grande.png');
  assert.equal(response.status, 413);
});

test('Transfiere los bytes de la imagen a IA y devuelve su resultado', async () => {
  const resultado = { total_personas: 2, detecciones: [], ancho: 100, alto: 100 };
  const app = crearApp({ solicitar: async (url, options) => {
    assert.ok(url.endsWith('/detect/image'));
    assert.equal(options.method, 'POST');
    assert.deepEqual(Buffer.from(await options.body.get('file').arrayBuffer()), imagen);
    return Response.json(resultado);
  }});
  const response = await request(app).post('/api/detect/image').attach('file', imagen, 'personas.png');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, resultado);
});

test('Explica una imagen corrupta rechazada por IA', async () => {
  const app = crearApp({ solicitar: async () => Response.json({ detail: 'Imagen ilegible.' }, { status: 422 }) });
  const response = await request(app).post('/api/detect/image').attach('file', imagen, 'corrupta.png');
  assert.equal(response.status, 422);
  assert.equal(response.body.error, 'Imagen ilegible.');
});

test('Devuelve un error comprensible cuando IA no responde', async () => {
  const app = crearApp({ solicitar: async () => { throw new Error('ECONNREFUSED'); } });
  const response = await request(app).post('/api/detect/image').attach('file', imagen, 'personas.png');
  assert.equal(response.status, 503);
  assert.match(response.body.error, /servicio de IA/);
});

test('No expone las funciones de cámara ni historial', async () => {
  for (const ruta of ['/api/detect/frame', '/api/history']) {
    const response = await request(crearApp()).post(ruta);
    assert.equal(response.status, 404);
  }
});

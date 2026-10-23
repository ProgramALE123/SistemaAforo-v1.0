# Sistema Aforo · Versión 1.0

Primer avance académico: aplicación web para detectar y contar personas en una imagen usando YOLO11n preentrenado. No se entrenó un modelo propio.

## Alcance de la entrega

- Cargar una imagen JPG, PNG o WebP (hasta 8 MB y 16 megapíxeles).
- Previsualizarla y ejecutar la detección a petición del usuario.
- Mostrar el total de personas y recuadros verdes en sus ubicaciones.
- Mostrar estados de espera y errores de carga o procesamiento.

Esta entrega no incluye cámara en vivo, tracking, alertas, históricos ni base de datos. El conteo es de personas visibles; no calcula ocupación de un establecimiento. Los archivos se procesan sin guardarse permanentemente. El modelo puede omitir personas o producir falsos positivos.

## Arquitectura

```text
React / Vite → Express → FastAPI / YOLO11n
  puerto 5180    3010         8010
```

- `cliente/src/App.jsx`: selección de archivo, envío y dibujo de recuadros SVG.
- `servidor/src/app.js`: validación multipart y comunicación con Python.
- `servicio_ia/main.py`: validación de imagen y endpoint de detección.
- `servicio_ia/deteccion/detector.py`: carga e inferencia del modelo, solo clase persona.
- `scripts/ejecutar_local.py`: arranca y detiene los tres componentes.

## Ejecutar con Docker (portable)

Para obtener el proyecto (necesitas acceso al repositorio privado):

```bash
git clone https://github.com/ProgramALE123/SistemaAforo-v1.0.git
cd SistemaAforo-v1.0
```

Con Docker y Compose instalados, desde esta carpeta:

```bash
docker compose up --build -d --wait --wait-timeout 240
```

Abrir **http://localhost:8080**. El código, las dependencias y el modelo se incluyen en las imágenes; no necesitas instalar Python, Node.js ni una base de datos. La primera construcción requiere Internet. Guía y comandos de parada en [documentacion/docker.md](documentacion/docker.md).

## Ejecutar en este equipo

```bash
cd /home/alejandro/SistemaAforo-v1.0
python3 scripts/ejecutar_local.py
```

Abrir http://localhost:5180. Ctrl+C detiene los tres componentes. Todos escuchan únicamente en la computadora local.

Para ahorrar espacio, este equipo utiliza enlaces a los `node_modules` y al entorno `.venv` del proyecto completo `../SistemaAforo`. El código de esta versión y el archivo del modelo son independientes; los entornos enlazados no se modificaron. Para trasladar esta versión, crea entornos propios siguiendo los pasos siguientes.

## Instalación independiente

Requiere Node.js 24 y Python 3.12. En una copia sin los enlaces de dependencias:

```bash
python3 -m venv .venv
.venv/bin/pip install torch==2.14.1+cpu torchvision==0.29.1+cpu --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install -r servicio_ia/requirements.txt
npm ci --prefix servidor
npm ci --prefix cliente
```

El repositorio incluye los pesos `yolo11n.pt` en `servicio_ia/modelos/`. Procedencia, huella SHA-256 y condiciones del proveedor en [documentacion/modelo.md](documentacion/modelo.md).

```bash
python3 scripts/ejecutar_local.py
```

## API mínima

- `GET /api/health`: estado del backend y del modelo.
- `POST /api/detect/image`: multipart con campo `file`.

Respuesta: `total_personas`, `detecciones` (confianza y caja `[x1,y1,x2,y2]` en píxeles), `ancho`, `alto`, `modelo` y `tiempo_inferencia_ms`. El umbral de confianza está fijado en 0.35. El tiempo mostrado es la inferencia, no la duración total de la solicitud.

## Verificación

```bash
npm test --prefix servidor
.venv/bin/pip install pytest httpx
.venv/bin/python -m pytest servicio_ia/tests -q
npm run build --prefix cliente
```

Ver `documentacion/primer_avance.md` para el objetivo, guion de demostración y límites de esta entrega.

# Sistema Aforo — v1.0

Aplicación web para detectar y contar personas visibles en imágenes con YOLO11n. Permite cargar una fotografía, analizarla y visualizar el conteo y los recuadros de detección.

## Ejecutar con Docker

Instala Git y Docker con Compose. En una terminal:

```bash
git clone https://github.com/ProgramALE123/SistemaAforo-v1.0.git
cd SistemaAforo-v1.0
docker compose up --build -d --wait --wait-timeout 240
```

Abre **http://localhost:8080**. La primera construcción descarga las imágenes base y las dependencias. El modelo se incluye en el repositorio. La configuración utiliza CPU y fue verificada en Linux x86_64.

Si el puerto está ocupado, copia `.env.example` a `.env`, cambia `AFORO_PORT` y vuelve a ejecutar Compose. Por ejemplo, con `AFORO_PORT=18080` la dirección será http://localhost:18080.

```bash
docker compose ps                 # Comprobar servicios
docker compose logs --tail=100    # Ver mensajes
docker compose down               # Detener la aplicación
```

Consulta la [guía de Docker](documentacion/docker.md).

## Estructura

```text
cliente/       React y Vite: carga de imágenes y resultados
servidor/      Express y Multer: API y validación de archivos
servicio_ia/   FastAPI, Pillow y YOLO11n: procesamiento y detección
scripts/       Arranque para desarrollo local
compose.yaml   Construcción y conexión de los tres servicios
```

El navegador envía la imagen a Express. El backend solicita la detección a FastAPI y devuelve el resultado. React dibuja los recuadros sobre la imagen mediante SVG. No se necesita una base de datos.

## Uso

1. Selecciona una imagen JPG, PNG o WebP de hasta 8 MB y 16 megapíxeles.
2. Pulsa **Detectar personas**.
3. Revisa el total y los recuadros verdes.

El conteo corresponde a personas visibles, no a ocupación acumulada. La iluminación, la distancia y las oclusiones pueden afectar la detección. Las imágenes no se guardan permanentemente.

## Desarrollo local

Requiere Python 3.12 y Node.js 24. Comandos para Linux, desde la carpeta del proyecto:

```bash
python3 -m venv .venv
.venv/bin/pip install torch==2.14.1+cpu torchvision==0.29.1+cpu --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install -r servicio_ia/requirements.txt
npm ci --prefix servidor
npm ci --prefix cliente
python3 scripts/ejecutar_local.py
```

La interfaz estará en http://localhost:5180. Ctrl+C detiene los tres procesos. Para Windows y macOS se recomienda el arranque mediante Docker en un entorno compatible con Linux amd64.

## API

- `GET /api/health`: estado del backend y del modelo.
- `POST /api/detect/image`: imagen multipart en el campo `file`.

El resultado contiene `total_personas`, `detecciones`, `ancho`, `alto`, `modelo` y `tiempo_inferencia_ms`. Cada detección incluye confianza y coordenadas `[x1, y1, x2, y2]`. El umbral es 0.35.

## Pruebas

```bash
npm test --prefix servidor
.venv/bin/pip install pytest httpx
.venv/bin/python -m pytest servicio_ia/tests -q
npm run build --prefix cliente
```

## Documentación

- [Alcance de la versión](documentacion/alcance.md).
- [Modelo y condiciones de uso](documentacion/modelo.md).
- [Docker y resolución de problemas](documentacion/docker.md).

# Ejecutar la versión 1.0 con Docker

Requiere Docker Engine o Docker Desktop con Compose v2 o posterior. El primer arranque necesita conexión a Internet para descargar imágenes y dependencias; no necesita Node.js, Python ni PostgreSQL instalados en el equipo. La configuración CPU está preparada para equipos Linux x86_64 (o Docker Desktop con contenedores Linux amd64); no se verificó ARM/Apple Silicon. Reserva varios GB para las imágenes, dependencias y caché de construcción.

Desde la carpeta del proyecto:

```bash
docker compose up --build -d --wait --wait-timeout 240
```

Abre http://localhost:8080. Los pesos YOLO11n están incluidos en el repositorio y se copian al contenedor IA. No se necesita archivo `.env`.

```text
Navegador → Nginx :8080 → backend :3010 → IA :8010
```

Solo la interfaz publica un puerto en localhost. Backend e IA se comunican dentro de la red Docker. Compose espera a que IA y backend pasen sus comprobaciones de salud antes de arrancar el siguiente componente.

## Comandos habituales

```bash
# Estado y mensajes de los servicios
docker compose ps
docker compose logs --tail=100

# Detener y retirar los contenedores de este proyecto
docker compose down

# Arrancar otra vez sin reconstruir
docker compose up -d --wait

# Reconstruir después de cambiar el código
docker compose up --build -d --wait
```

El arranque local con Python sigue usando http://localhost:5180 y puede coexistir con Docker.

Si 8080 está ocupado, en Bash:

```bash
AFORO_PORT=18080 docker compose up --build -d --wait
```

O crea `.env` junto a `compose.yaml` con `AFORO_PORT=18080`. Para puertos alternativos conserva esa configuración al ejecutar Compose. En ese caso, abre http://localhost:18080.

## Comprobación

```bash
curl --fail http://localhost:8080/api/health
```

Carga una fotografía, pulsa «Detectar personas» y compara el resultado con el conteo manual. La primera inferencia puede tardar más mientras se inicializa el modelo. La aplicación no guarda imágenes ni registros entre solicitudes.

Los Dockerfiles usan construcción por etapas para la interfaz y ejecutan backend e IA con usuarios sin privilegios. Las versiones de Node se fijan a la rama 24, Python a 3.12 y Nginx a stable; las etiquetas base reciben actualizaciones y no son imágenes fijadas por digest.

Referencia: [orden de arranque y comprobaciones de salud en Docker Compose](https://docs.docker.com/compose/how-tos/startup-order/).

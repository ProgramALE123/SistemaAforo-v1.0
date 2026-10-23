# Primer avance · Versión 1.0

## Objetivo

Implementar un prototipo web que detecte y cuente personas visibles en imágenes utilizando un modelo preentrenado.

## Trabajo implementado

Interfaz React para carga y previsualización; API Express que valida archivos y solicita el análisis; servicio FastAPI que prepara la imagen e invoca YOLO11n; visualización del conteo y de las coordenadas devueltas. No se necesita PostgreSQL.

Los conocimientos a explicar son: petición HTTP multipart, validación de archivos, inferencia con modelo preentrenado, coordenadas de cajas y separación entre interfaz y servicios. YOLO fue desarrollado por terceros; esta entrega integra ese modelo en una aplicación.

## Demostración sugerida

1. Ejecutar `python3 scripts/ejecutar_local.py` y abrir http://localhost:5180.
2. Seleccionar una imagen propia o con permiso de uso donde haya personas claramente visibles.
3. Pulsar «Detectar personas» y comparar manualmente el conteo y los recuadros.
4. Repetir con una imagen sin personas y comprobar el resultado cero.
5. Seleccionar un archivo no admitido y comprobar el mensaje de error.
6. Explicar que una persona tapada, pequeña o poco iluminada puede no detectarse.

## Criterios de aceptación

La selección muestra una vista previa; el botón se habilita al cargar un archivo permitido; durante el análisis se impiden solicitudes simultáneas; el resultado muestra conteo y recuadros; se puede cambiar de imagen y repetir; los errores no rompen la pantalla.

## Alcance futuro

Cámara en vivo, registro en base de datos, históricos, capacidad y alertas, seguimiento de entradas y salidas. No forman parte de esta entrega.

## Evidencia y límites

Las pruebas automatizadas de validación usan un detector de prueba para comprobar contratos y errores; no miden la precisión de YOLO. La precisión debe evaluarse por separado con imágenes reales y conteo manual. Un ensayo funcional con el modelo no equivale a una evaluación estadística.

## Verificación de esta copia (22 de octubre de 2026)

- Compilación de React/Vite completada.
- 7 pruebas del backend y 5 de la API Python aprobadas.
- Navegador Chromium: foto real `val2017_227478.jpg`, 2 personas y 2 recuadros; imagen blanca, 0 personas.
- Comprobados los errores de tipo de archivo y contenido corrupto, la sustitución de imagen y la vista móvil de 390 px sin desbordamiento horizontal.
- Sin errores de JavaScript durante el recorrido.

La fotografía de prueba pertenece al conjunto COCO ya presente en el proyecto completo. No se incluye en esta entrega. Este ensayo comprueba el flujo funcional, no determina la precisión general del modelo. Las capturas locales están en `.runtime/version1-escritorio.png` y `.runtime/version1-movil.png`.

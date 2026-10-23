# Alcance de la versión 1.0

## Objetivo

Detectar y contar personas visibles en una imagen mediante una aplicación web y un modelo preentrenado.

## Funciones

- Seleccionar y previsualizar imágenes JPG, PNG y WebP.
- Validar tipo, tamaño máximo de 8 MB y resolución de hasta 16 megapíxeles.
- Ejecutar la detección de personas con YOLO11n.
- Mostrar conteo, recuadros y tiempo de inferencia.
- Informar errores de archivo y de conexión sin abandonar la pantalla.

## Límites

No incluye cámara en vivo, seguimiento de entradas y salidas, historial, alertas ni base de datos. No estima ocupación acumulada. El modelo es preentrenado; no se realizó entrenamiento propio. Los conteos pueden contener errores y requieren comparación manual para evaluar su precisión.

## Criterios de funcionamiento

La imagen se previsualiza antes de analizarse. Durante una solicitud se impide iniciar otra. Al cambiar de imagen se limpia el resultado anterior. Una imagen sin personas devuelve cero. Los archivos corruptos o no admitidos generan un mensaje comprensible.

## Verificación

La aplicación cuenta con 7 pruebas del backend y 6 pruebas de la API Python. Se comprobó el flujo completo en Chromium con una fotografía de prueba, una imagen vacía, archivos inválidos y vista móvil de 390 px. Estas comprobaciones validan el funcionamiento; no constituyen una evaluación estadística del modelo.

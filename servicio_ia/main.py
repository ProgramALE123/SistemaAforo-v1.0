"""Primera entrega: detección de personas en una imagen, sin persistencia."""
import io
from contextlib import asynccontextmanager
from threading import Lock

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
from PIL.Image import open as abrir_imagen
from starlette.responses import JSONResponse

MAX_BYTES = 8 * 1024 * 1024
MAX_PIXELS = 16_000_000
Image.MAX_IMAGE_PIXELS = MAX_PIXELS
detector = None
lock = Lock()


@asynccontextmanager
async def lifespan(app):
    global detector
    from deteccion.detector import Detector
    detector = Detector()
    yield


app = FastAPI(title='Sistema Aforo · Primera entrega', version='1.0.0', lifespan=lifespan)


class LimitarCuerpo:
    """Limita también cargas multipart antes de escribir archivos temporales."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        limite = MAX_BYTES + 65536
        headers = dict(scope.get('headers', []))
        try:
            length = int(headers.get(b'content-length', b'0'))
        except ValueError:
            length = limite + 1
        if length > limite:
            return await JSONResponse({'detail': 'La solicitud supera el límite permitido.'}, status_code=413)(scope, receive, send)
        total = 0
        async def acotado():
            nonlocal total
            message = await receive()
            total += len(message.get('body', b''))
            if total > limite:
                raise HTTPException(413, 'La solicitud supera el límite permitido.')
            return message
        await self.app(scope, acotado, send)


app.add_middleware(LimitarCuerpo)


@app.get('/health')
def health():
    if detector is None:
        raise HTTPException(503, 'Modelo no cargado.')
    return {'estado': 'ok', 'modelo': detector.pesos.name, 'device': detector.device}


@app.post('/detect/image')
def detectar(file: UploadFile = File(...)):
    if not lock.acquire(blocking=False):
        raise HTTPException(429, 'El servicio está ocupado. Intenta nuevamente.')
    try:
        if detector is None:
            raise HTTPException(503, 'Modelo no cargado.')
        if file.content_type not in ('image/jpeg', 'image/png', 'image/webp'):
            raise HTTPException(415, 'Selecciona una imagen JPG, PNG o WebP.')
        raw = file.file.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise HTTPException(413, 'La imagen supera los 8 MB.')
        try:
            # Conservar el lector Pillow original: Ultralytics modifica Image.open
            # e intenta cargar un plugin HEIF al recibir archivos corruptos.
            with abrir_imagen(io.BytesIO(raw), formats=('JPEG', 'PNG', 'WEBP')) as src:
                if src.format not in ('JPEG', 'PNG', 'WEBP'):
                    raise ValueError('Formato no admitido')
                if src.width * src.height > MAX_PIXELS:
                    raise ValueError('Demasiados píxeles')
                imagen = ImageOps.exif_transpose(src).convert('RGB')
        except (OSError, ValueError, UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
            raise HTTPException(422, 'Imagen ilegible o demasiado grande. Usa una imagen de hasta 16 megapíxeles.') from exc
        return detector.detectar(imagen, .35)
    finally:
        lock.release()
        file.file.close()

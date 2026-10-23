import io
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main


class DetectorPrueba:
    def detectar(self, imagen, confianza):
        assert imagen.mode == 'RGB'
        assert confianza == .35
        return {'total_personas': 0, 'detecciones': [], 'ancho': imagen.width, 'alto': imagen.height}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(main, 'detector', DetectorPrueba())
    # Sin lifespan: estas pruebas de validación no cargan los pesos reales.
    return TestClient(main.app)


def test_imagen_valida_sin_personas(client):
    data = io.BytesIO()
    Image.new('RGB', (64, 48)).save(data, format='PNG')
    response = client.post('/detect/image', files={'file': ('imagen.png', data.getvalue(), 'image/png')})
    assert response.status_code == 200
    assert response.json() == {'total_personas': 0, 'detecciones': [], 'ancho': 64, 'alto': 48}


def test_archivo_corrupto(client):
    response = client.post('/detect/image', files={'file': ('imagen.png', b'no es imagen', 'image/png')})
    assert response.status_code == 422


def test_tipo_no_admitido(client):
    response = client.post('/detect/image', files={'file': ('texto.txt', b'abc', 'text/plain')})
    assert response.status_code == 415


def test_orientacion_exif(client):
    image = Image.new('RGB', (80, 40))
    exif = image.getexif()
    exif[274] = 6
    data = io.BytesIO()
    image.save(data, format='JPEG', exif=exif)
    response = client.post('/detect/image', files={'file': ('foto.jpg', data.getvalue(), 'image/jpeg')})
    assert response.status_code == 200
    assert response.json()['ancho'] == 40
    assert response.json()['alto'] == 80


def test_sin_modelo(client, monkeypatch):
    monkeypatch.setattr(main, 'detector', None)
    response = client.post('/detect/image', files={'file': ('foto.jpg', b'abc', 'image/jpeg')})
    assert response.status_code == 503


def test_corrupta_tras_importar_yolo_sin_plugin_heif(client, monkeypatch):
    # Reproduce el entorno limpio del contenedor, sin complementos opcionales.
    import ultralytics.utils.patches
    monkeypatch.setitem(sys.modules, 'pi_heif', None)
    response = client.post('/detect/image', files={'file': ('imagen.png', b'no es imagen', 'image/png')})
    assert response.status_code == 422
    assert 'Imagen ilegible' in response.json()['detail']

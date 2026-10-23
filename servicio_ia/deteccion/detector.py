import os
from pathlib import Path
from time import perf_counter
os.environ.setdefault("YOLO_AUTOINSTALL", "False")
os.environ.setdefault("YOLO_CONFIG_DIR", str(Path(__file__).parents[2]/".runtime/ultralytics"))
import torch
from ultralytics import YOLO

class Detector:
    def __init__(self):
        self.pesos = Path(os.getenv('MODEL_PATH', str(Path(__file__).parents[1]/'modelos/yolo11n.pt')))
        if not self.pesos.is_file():
            raise RuntimeError(f'No existen los pesos: {self.pesos}. Coloque yolo11n.pt en servicio_ia/modelos/ (ver README.md)')
        torch.set_num_threads(int(os.getenv('TORCH_THREADS','2')))
        self.device = os.getenv('DEVICE', 'cuda:0' if torch.cuda.is_available() else 'cpu')
        self.modelo = YOLO(str(self.pesos))

    def detectar(self, imagen, confianza):
        inicio = perf_counter()
        r = self.modelo.predict(imagen, classes=[0], conf=confianza, device=self.device,
                                imgsz=640, verbose=False, save=False)[0]
        detecciones = [{'clase':'person','confianza':round(float(b.conf[0]),5),
                        'bbox':[round(float(v),2) for v in b.xyxy[0].tolist()]} for b in r.boxes]
        return {'total_personas':len(detecciones), 'modelo':self.pesos.name,
                'tiempo_inferencia_ms':round((perf_counter()-inicio)*1000,2),
                'ancho':imagen.width,'alto':imagen.height,'detecciones':detecciones}

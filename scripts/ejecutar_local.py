"""Arranca los tres componentes de la versión 1.0, sin base de datos."""
import os
from pathlib import Path
import signal
import subprocess
import time

root = Path(__file__).resolve().parents[1]
env = os.environ.copy()
env.update(YOLO_AUTOINSTALL='False', DEVICE='cpu', TORCH_THREADS='2',
           YOLO_CONFIG_DIR=str(root/'.runtime/ultralytics'))
(root/'.runtime').mkdir(exist_ok=True)
commands = [
    ([str(root/'.venv/bin/python'), '-m', 'uvicorn', 'main:app', '--app-dir', 'servicio_ia', '--host', '127.0.0.1', '--port', '8010'], root),
    (['node', 'servidor/src/index.js'], root),
    (['npm', 'run', 'dev'], root/'cliente'),
]
children = []

def interrumpir(*args):
    raise KeyboardInterrupt

signal.signal(signal.SIGTERM, interrumpir)
signal.signal(signal.SIGINT, interrumpir)
try:
    for command, cwd in commands:
        children.append(subprocess.Popen(command, cwd=cwd, env=env, start_new_session=True))
    print('Sistema Aforo v1.0: http://localhost:5180', flush=True)
    while all(child.poll() is None for child in children):
        time.sleep(.5)
    raise SystemExit('Un componente terminó. Revisa el mensaje anterior.')
except KeyboardInterrupt:
    print('Deteniendo versión 1.0…')
finally:
    for child in children:
        if child.poll() is None:
            os.killpg(child.pid, signal.SIGTERM)
    for child in children:
        try:
            child.wait(timeout=10)
        except subprocess.TimeoutExpired:
            os.killpg(child.pid, signal.SIGKILL)

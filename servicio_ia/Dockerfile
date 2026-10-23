FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    YOLO_AUTOINSTALL=False YOLO_CONFIG_DIR=/tmp/ultralytics DEVICE=cpu TORCH_THREADS=2
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./
RUN pip install torch==2.14.1+cpu torchvision==0.29.1+cpu --index-url https://download.pytorch.org/whl/cpu \
    && pip install -r requirements.txt
COPY main.py ./
COPY deteccion ./deteccion
COPY modelos/yolo11n.pt ./modelos/yolo11n.pt
RUN useradd --uid 10001 --create-home aforo
USER aforo
EXPOSE 8010
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8010"]

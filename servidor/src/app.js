import express from "express";
import multer from "multer";

const MAX_BYTES = 8 * 1024 * 1024;
const formatos = new Set(["image/jpeg", "image/png", "image/webp"]);

export function crearApp({
  iaUrl = "http://127.0.0.1:8010",
  solicitar = fetch,
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES, files: 1, fields: 0 },
    fileFilter(req, file, cb) {
      if (formatos.has(file.mimetype)) return cb(null, true);
      cb(
        Object.assign(new Error("Selecciona una imagen JPG, PNG o WebP."), {
          status: 415,
        }),
      );
    },
  });

  app.get("/api/health", async (req, res, next) => {
    try {
      const response = await solicitar(`${iaUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok)
        return res
          .status(503)
          .json({ error: "El modelo de IA no está disponible." });
      res.json({ estado: "ok", version: "1.0.0", ia: await response.json() });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/detect/image",
    upload.single("file"),
    async (req, res, next) => {
      try {
        if (!req.file)
          return res.status(400).json({ error: "Debes adjuntar una imagen." });
        const body = new FormData();
        body.append(
          "file",
          new Blob([req.file.buffer], { type: req.file.mimetype }),
          "imagen",
        );
        const response = await solicitar(`${iaUrl}/detect/image`, {
          method: "POST",
          body,
          signal: AbortSignal.timeout(60000),
        });
        const result = await response.json();
        if (!response.ok)
          return res.status(response.status).json({
            error:
              typeof result.detail === "string"
                ? result.detail
                : "No se pudo analizar la imagen.",
          });
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada." }));
  app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        error:
          error.code === "LIMIT_FILE_SIZE"
            ? "La imagen supera los 8 MB."
            : "Adjunta únicamente una imagen en el campo file.",
      });
    }
    if (error.status)
      return res.status(error.status).json({ error: error.message });
    res
      .status(503)
      .json({
        error:
          "No se pudo conectar con el servicio de IA. Comprueba que esté iniciado y vuelve a intentar.",
      });
  });
  return app;
}

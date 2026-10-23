import { useEffect, useRef, useState } from "react";
import Imagen from "./componentes/Imagen.jsx";

const FORMATOS = ["image/jpeg", "image/png", "image/webp"];

export default function App() {
  const [archivo, setArchivo] = useState(null);
  const [src, setSrc] = useState("");
  const [resultado, setResultado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const input = useRef(null);
  const solicitud = useRef(null);

  useEffect(() => {
    if (!archivo) {
      setSrc("");
      return;
    }
    const url = URL.createObjectURL(archivo);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);
  useEffect(() => () => solicitud.current?.abort(), []);

  function seleccionar(file) {
    if (!file || ocupado) return;
    setError("");
    if (!FORMATOS.includes(file.type)) {
      setError("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen supera los 8 MB. Selecciona una más pequeña.");
      return;
    }
    setArchivo(file);
    setResultado(null);
  }

  async function analizar() {
    if (!archivo || ocupado) return;
    setOcupado(true);
    setError("");
    setResultado(null);
    const control = new AbortController();
    solicitud.current = control;
    const timeout = setTimeout(() => control.abort(), 65000);
    try {
      const body = new FormData();
      body.append("file", archivo);
      const response = await fetch("/api/detect/image", {
        method: "POST",
        body,
        signal: control.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No se pudo analizar la imagen.");
      setResultado(data);
    } catch (err) {
      setError(
        err.name === "AbortError"
          ? "El análisis tardó demasiado. Intenta nuevamente."
          : err instanceof TypeError
            ? "No se pudo conectar con el servidor. Intenta nuevamente."
            : err.message,
      );
    } finally {
      clearTimeout(timeout);
      solicitud.current = null;
      setOcupado(false);
    }
  }

  return (
    <>
      <header>
        <a className="marca" href="/" aria-label="Sistema Aforo, inicio">
          <span className="logo" aria-hidden="true">
            ▧
          </span>
          Sistema Aforo
        </a>
        <span className="version">Versión 1.0</span>
      </header>
      <main>
        <div className="intro">
          <p className="etiqueta">CONTEO DE PERSONAS</p>
          <h1>
            Detección de personas
            <br />
            en imágenes.
          </h1>
          <p>
            Carga una fotografía para identificar y contar las personas
            visibles.
          </p>
        </div>
        <div className="espacio-trabajo">
          <section className="panel carga" aria-labelledby="titulo-carga">
            <div className="paso">01 / IMAGEN</div>
            <h2 id="titulo-carga">Comienza con una fotografía</h2>
            <p>Usa una imagen clara donde se distingan las personas.</p>
            <input
              ref={input}
              id="imagen"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={ocupado}
              onChange={(e) => {
                seleccionar(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              className="zona-carga"
              disabled={ocupado}
              onClick={() => input.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                seleccionar(e.dataTransfer.files[0]);
              }}
            >
              <span className="icono-carga" aria-hidden="true">
                ↑
              </span>
              <strong>
                {archivo ? "Cambiar imagen" : "Seleccionar imagen"}
              </strong>
              <span>o arrástrala aquí</span>
              <small>JPG, PNG o WebP · Hasta 8 MB y 16 MP</small>
            </button>
            {archivo && (
              <p className="nombre-archivo" title={archivo.name}>
                {archivo.name}{" "}
                <span>· {(archivo.size / 1024 / 1024).toFixed(2)} MB</span>
              </p>
            )}
            <button
              className="boton-analizar"
              disabled={!archivo || ocupado}
              onClick={analizar}
            >
              {ocupado ? "Analizando imagen…" : "Detectar personas"}
              <span aria-hidden="true">→</span>
            </button>
            {ocupado && (
              <p role="status">Procesando con YOLO11n. Espera un momento…</p>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="nota">
              <strong>¿Cómo funciona?</strong>
              <p>
                El modelo preentrenado YOLO11n identifica personas y marca su
                ubicación. Las imágenes se procesan sin guardarse
                permanentemente.
              </p>
            </div>
          </section>
          <section
            className="panel vista"
            aria-labelledby="titulo-resultado"
            aria-busy={ocupado}
          >
            <div className="encabezado-resultado">
              <div>
                <div className="paso">02 / RESULTADO</div>
                <h2 id="titulo-resultado">Vista de detección</h2>
              </div>
              <span className="estado">
                {ocupado
                  ? "Procesando"
                  : resultado
                    ? "Análisis completado"
                    : archivo
                      ? "Imagen lista"
                      : "Sin imagen"}
              </span>
            </div>
            <div className="visor">
              {src ? (
                <Imagen src={src} resultado={resultado} />
              ) : (
                <div className="vacio">
                  <span aria-hidden="true">▧</span>
                  <h3>Tu imagen aparecerá aquí</h3>
                  <p>Selecciona una fotografía para comenzar.</p>
                </div>
              )}
            </div>
            <div className="resumen" aria-live="polite">
              <div>
                <span>PERSONAS DETECTADAS</span>
                <strong>{resultado ? resultado.total_personas : "—"}</strong>
              </div>
              <p>
                {resultado
                  ? resultado.total_personas === 0
                    ? "No se detectaron personas con el umbral actual."
                    : "Los recuadros verdes indican la ubicación de las personas detectadas."
                  : "El conteo aparecerá después de analizar la imagen."}
              </p>
            </div>
            {resultado && (
              <p className="metadatos">
                Modelo: {resultado.modelo} · Inferencia:{" "}
                {Math.round(resultado.tiempo_inferencia_ms)} ms · Confianza
                mínima: 35%
              </p>
            )}
          </section>
        </div>
        <p className="limite">
          Este prototipo cuenta personas visibles en una imagen. La iluminación,
          la distancia y las oclusiones pueden afectar el resultado.
        </p>
      </main>
      <footer>
        <span>Sistema Aforo · Versión 1.0</span>
        <span>Detección en imágenes / v1.0</span>
      </footer>
    </>
  );
}

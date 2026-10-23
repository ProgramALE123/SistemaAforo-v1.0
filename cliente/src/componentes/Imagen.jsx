export default function Imagen({ src, resultado }) {
  return (
    <div className="imagen-marco">
      <img src={src} alt="Imagen seleccionada para detectar personas" />
      {resultado && (
        <svg
          viewBox={`0 0 ${resultado.ancho} ${resultado.alto}`}
          role="img"
          aria-label={`${resultado.total_personas} personas detectadas`}
        >
          {resultado.detecciones.map((d, i) => {
            const [x1, y1, x2, y2] = d.bbox;
            return (
              <g key={i}>
                <rect
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  className="caja"
                />
                <title>{`Persona ${i + 1}: ${Math.round(d.confianza * 100)}% de confianza`}</title>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

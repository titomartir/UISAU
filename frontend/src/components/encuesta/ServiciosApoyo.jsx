const CANONICAL_SERVICIOS = {
  psicologia: 'psicologia',
  nutricion: 'nutricion',
  trabajo_social: 'trabajo_social',
  laboratorio_clinico: 'laboratorio',
  imagenes_diagnosticas: 'imagenes',
  uisau: 'uisau'
};

function toCanonical(valorTexto) {
  const normalized = (valorTexto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
  return CANONICAL_SERVICIOS[normalized] || normalized;
}

function ServiciosApoyo({ preguntaServicios, preguntasCondicionales, seleccionados, respuestas, onToggleServicio, onResponderLikert }) {
  if (!preguntaServicios) return null;

  return (
    <section className="card-surface p-6">
      <h2 className="mb-4 text-2xl font-bold text-brand-800">Servicios de apoyo</h2>
      <p className="mb-3 text-brand-900">{preguntaServicios.texto_pregunta}</p>

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {preguntaServicios.opciones?.map((op) => {
          const canonical = toCanonical(op.valor_texto);
          const checked = seleccionados.includes(canonical);
          return (
            <label key={op.id} className="flex items-center gap-2 rounded-lg border bg-white p-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleServicio(canonical, op.id)}
              />
              <span>{op.valor_texto}</span>
            </label>
          );
        })}
      </div>

      {!seleccionados.length && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
          Si no recibió servicios de apoyo, puede continuar al siguiente paso.
        </div>
      )}

      <div className="space-y-4">
        {preguntasCondicionales.map((p) => (
          <article key={p.id} className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <p className="mb-3 font-semibold">{p.texto_pregunta}</p>
            <div className="grid gap-2 sm:grid-cols-5">
              {p.opciones?.map((op) => (
                <label key={op.id} className="flex items-center gap-2 rounded-lg border bg-white p-2 text-sm">
                  <input
                    type="radio"
                    name={`servicio-${p.id}`}
                    checked={respuestas[p.id]?.opcion_id === op.id}
                    onChange={() => onResponderLikert(p.id, { opcion_id: op.id, respuesta_texto: null })}
                  />
                  {op.valor_texto}
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ServiciosApoyo;

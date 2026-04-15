function PreguntasLikert({ titulo, preguntas, respuestas, onResponder }) {
  if (!preguntas?.length) return null;

  return (
    <section className="card-surface p-6">
      <h2 className="mb-4 text-2xl font-bold text-brand-800">{titulo}</h2>
      <div className="space-y-6">
        {preguntas.map((p) => (
          <article key={p.id} className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
            <p className="mb-3 font-semibold text-brand-900">{p.texto_pregunta}</p>
            <div className="grid gap-2 sm:grid-cols-5">
              {p.opciones?.map((op) => (
                <label key={op.id} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-2 text-sm">
                  <input
                    type="radio"
                    name={`pregunta-${p.id}`}
                    checked={respuestas[p.id]?.opcion_id === op.id}
                    onChange={() => onResponder(p.id, { opcion_id: op.id, respuesta_texto: null })}
                    aria-label={`${p.texto_pregunta} ${op.valor_texto}`}
                  />
                  <span>{op.valor_texto}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PreguntasLikert;

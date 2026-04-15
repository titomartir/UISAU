function PreguntasAbiertas({ preguntas, respuestas, onResponder }) {
  if (!preguntas?.length) return null;

  return (
    <section className="card-surface p-6">
      <h2 className="mb-4 text-2xl font-bold text-brand-800">Preguntas abiertas</h2>
      <div className="space-y-4">
        {preguntas.map((p) => (
          <label key={p.id} className="flex flex-col gap-2">
            <span className="font-semibold text-brand-900">{p.texto_pregunta}</span>
            <textarea
              rows={4}
              maxLength={2000}
              className="rounded-lg border border-brand-200 p-3"
              value={respuestas[p.id]?.respuesta_texto || ''}
              onChange={(e) => onResponder(p.id, { opcion_id: null, respuesta_texto: e.target.value })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

export default PreguntasAbiertas;

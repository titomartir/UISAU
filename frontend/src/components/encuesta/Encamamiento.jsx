import PreguntasLikert from './PreguntasLikert';

function Encamamiento({ servicio, preguntas, respuestas, onResponder }) {
  if (servicio !== 'encamamiento') {
    return (
      <section className="card-surface p-6">
        <h2 className="mb-2 text-2xl font-bold text-brand-800">Encamamiento</h2>
        <p>Este bloque solo aplica para pacientes en servicio de encamamiento.</p>
      </section>
    );
  }

  return (
    <PreguntasLikert
      titulo="Encamamiento"
      preguntas={preguntas}
      respuestas={respuestas}
      onResponder={onResponder}
    />
  );
}

export default Encamamiento;

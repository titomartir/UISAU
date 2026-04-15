function BotonesNavegacion({ paso, totalPasos = 10, onPrev, onNext, onSubmit, loading }) {
  const esUltimoPaso = paso === totalPasos;

  return (
    <div className="mt-6 flex items-center justify-between">
      <button
        type="button"
        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onPrev}
        disabled={paso <= 1 || loading}
      >
        Anterior
      </button>

      {!esUltimoPaso ? (
        <button type="button" className="btn-primary" onClick={onNext} disabled={loading}>
          Siguiente
        </button>
      ) : (
        <button type="button" className="btn-primary" onClick={onSubmit} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar encuesta'}
        </button>
      )}
    </div>
  );
}

export default BotonesNavegacion;

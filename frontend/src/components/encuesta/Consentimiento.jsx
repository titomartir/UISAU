function Consentimiento({ consentimiento, onAccept, onReject }) {
  if (consentimiento === false) {
    return (
      <section className="card-surface p-6">
        <h2 className="mb-3 text-2xl font-bold text-brand-800">Gracias por su tiempo</h2>
        <p className="mb-4 text-brand-900">
          Usted decidió no participar en la encuesta. Respetamos su decisión.
        </p>
        <a href="/" className="btn-secondary inline-block">Salir</a>
      </section>
    );
  }

  return (
    <section className="card-surface p-6">
      <h2 className="mb-3 text-2xl font-bold text-brand-800">Consentimiento informado</h2>
      <p className="mb-4 leading-relaxed text-brand-900">
        Su participación es voluntaria y anónima. La información recolectada será utilizada
        para mejorar la calidad de la atención en los hospitales nacionales. Esta encuesta
        no afecta su acceso a servicios de salud y puede retirarse en cualquier momento.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onAccept} className="btn-primary" aria-label="Aceptar consentimiento">
          Acepto
        </button>
        <button type="button" onClick={onReject} className="btn-secondary" aria-label="No aceptar consentimiento">
          No acepto
        </button>
      </div>
    </section>
  );
}

export default Consentimiento;

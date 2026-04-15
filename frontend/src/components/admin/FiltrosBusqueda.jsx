function FiltrosBusqueda({ filtros, onChange, onBuscar, onLimpiar }) {
  return (
    <section className="card-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1">
          <span>Fecha inicio</span>
          <input type="date" className="rounded-lg border p-2" value={filtros.fecha_inicio || ''} onChange={(e) => onChange('fecha_inicio', e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Fecha fin</span>
          <input type="date" className="rounded-lg border p-2" value={filtros.fecha_fin || ''} onChange={(e) => onChange('fecha_fin', e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span>Hospital</span>
          <input className="rounded-lg border p-2" value={filtros.hospital || ''} onChange={(e) => onChange('hospital', e.target.value)} placeholder="Nombre hospital" />
        </label>
        <label className="flex flex-col gap-1">
          <span>Servicio</span>
          <select className="rounded-lg border p-2" value={filtros.servicio || ''} onChange={(e) => onChange('servicio', e.target.value)}>
            <option value="">Todos</option>
            <option value="consulta_externa">Consulta Externa</option>
            <option value="emergencia">Emergencia</option>
            <option value="encamamiento">Encamamiento</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button type="button" className="btn-primary w-full" onClick={onBuscar}>Filtrar</button>
          <button type="button" className="btn-secondary w-full" onClick={onLimpiar}>Limpiar</button>
        </div>
      </div>
    </section>
  );
}

export default FiltrosBusqueda;

import { formatearFecha, formatearServicio } from '../../utils/formateadores';

function TablaRespuestas({ respuestas, loading, onVerDetalle, onMarcarRevisada, paginaActual, totalPaginas, onCambiarPagina }) {
  return (
    <section className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-brand-900 text-left text-white">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Edad</th>
              <th className="p-3">Sexo</th>
              <th className="p-3">Departamento</th>
              <th className="p-3">Hospital</th>
              <th className="p-3">Servicio</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="9" className="p-6 text-center">Cargando respuestas...</td>
              </tr>
            )}
            {!loading && !respuestas.length && (
              <tr>
                <td colSpan="9" className="p-6 text-center">No hay datos para estos filtros.</td>
              </tr>
            )}
            {!loading && respuestas.map((r) => (
              <tr key={r.id} className="border-t border-brand-100 hover:bg-brand-50/50">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{formatearFecha(r.created_at)}</td>
                <td className="p-3">{r.edad}</td>
                <td className="p-3">{r.sexo}</td>
                <td className="p-3">{r.departamento}</td>
                <td className="p-3">{r.hospital}</td>
                <td className="p-3">{formatearServicio(r.servicio)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${r.revisada ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.revisada ? 'Revisada' : 'Pendiente'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs" onClick={() => onVerDetalle(r.id)}>Ver</button>
                    <button className="btn-primary text-xs" onClick={() => onMarcarRevisada(r.id)}>
                      {r.revisada ? 'Desmarcar' : 'Marcar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-brand-100 p-3">
        <span className="text-sm">Página {paginaActual} de {Math.max(totalPaginas, 1)}</span>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={() => onCambiarPagina(paginaActual - 1)} disabled={paginaActual <= 1}>Anterior</button>
          <button className="btn-secondary text-sm" onClick={() => onCambiarPagina(paginaActual + 1)} disabled={paginaActual >= totalPaginas}>Siguiente</button>
        </div>
      </div>
    </section>
  );
}

export default TablaRespuestas;

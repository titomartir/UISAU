import { GUATEMALA_DEPARTAMENTOS, HOSPITALES_NACIONALES } from '../../utils/guatemalaData';

function DatosDemograficos({ data, onChange, errores = {} }) {
  const municipios = GUATEMALA_DEPARTAMENTOS[data.departamento] || [];

  const handleDepartamentoChange = (departamento) => {
    onChange('departamento', departamento);
    const municipiosDepto = GUATEMALA_DEPARTAMENTOS[departamento] || [];
    if (!municipiosDepto.includes(data.municipio)) {
      onChange('municipio', municipiosDepto[0] || '');
    }
  };

  return (
    <section className="card-surface p-6">
      <h2 className="mb-4 text-2xl font-bold text-brand-800">Datos demográficos</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span>Origen étnico</span>
          <select className="rounded-lg border p-2" value={data.origen_etnico} onChange={(e) => onChange('origen_etnico', e.target.value)}>
            <option value="">Seleccione</option>
            <option value="Maya">Maya</option>
            <option value="Xinka">Xinka</option>
            <option value="Garífuna">Garífuna</option>
            <option value="Ladino">Ladino</option>
            <option value="Otro">Otro</option>
          </select>
          {errores.origen_etnico && <small className="text-red-600">{errores.origen_etnico}</small>}
        </label>

        <label className="flex flex-col gap-1">
          <span>Edad</span>
          <input type="number" min="0" max="120" className="rounded-lg border p-2" value={data.edad} onChange={(e) => onChange('edad', e.target.value)} />
          {errores.edad && <small className="text-red-600">{errores.edad}</small>}
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2">Sexo</legend>
          <div className="flex gap-4">
            {['Masculino', 'Femenino', 'Otro'].map((sexo) => (
              <label key={sexo} className="flex items-center gap-2">
                <input type="radio" name="sexo" checked={data.sexo === sexo} onChange={() => onChange('sexo', sexo)} />
                {sexo}
              </label>
            ))}
          </div>
          {errores.sexo && <small className="text-red-600">{errores.sexo}</small>}
        </fieldset>

        <label className="flex flex-col gap-1">
          <span>Departamento</span>
          <select className="rounded-lg border p-2" value={data.departamento} onChange={(e) => handleDepartamentoChange(e.target.value)}>
            <option value="">Seleccione</option>
            {Object.keys(GUATEMALA_DEPARTAMENTOS).map((dep) => <option key={dep} value={dep}>{dep}</option>)}
          </select>
          {errores.departamento && <small className="text-red-600">{errores.departamento}</small>}
        </label>

        <label className="flex flex-col gap-1">
          <span>Municipio</span>
          <select className="rounded-lg border p-2" value={data.municipio} onChange={(e) => onChange('municipio', e.target.value)}>
            <option value="">Seleccione</option>
            {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {errores.municipio && <small className="text-red-600">{errores.municipio}</small>}
        </label>

        <label className="flex flex-col gap-1">
          <span>Hospital</span>
          <select className="rounded-lg border p-2" value={data.hospital} onChange={(e) => onChange('hospital', e.target.value)}>
            <option value="">Seleccione</option>
            {HOSPITALES_NACIONALES.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          {errores.hospital && <small className="text-red-600">{errores.hospital}</small>}
        </label>

        <label className="flex flex-col gap-1">
          <span>Servicio</span>
          <select className="rounded-lg border p-2" value={data.servicio} onChange={(e) => onChange('servicio', e.target.value)}>
            <option value="">Seleccione</option>
            <option value="consulta_externa">Consulta Externa</option>
            <option value="emergencia">Emergencia</option>
            <option value="encamamiento">Encamamiento</option>
          </select>
          {errores.servicio && <small className="text-red-600">{errores.servicio}</small>}
        </label>

        <label className="flex flex-col gap-1">
          <span>Teléfono (opcional)</span>
          <input className="rounded-lg border p-2" value={data.telefono} onChange={(e) => onChange('telefono', e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Email de contacto (opcional)</span>
          <input type="email" className="rounded-lg border p-2" value={data.email_contacto} onChange={(e) => onChange('email_contacto', e.target.value)} />
          {errores.email_contacto && <small className="text-red-600">{errores.email_contacto}</small>}
        </label>
      </div>
    </section>
  );
}

export default DatosDemograficos;

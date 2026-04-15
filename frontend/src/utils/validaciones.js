export const validarDemograficos = (datos) => {
  const errores = {};

  if (!datos.origen_etnico) errores.origen_etnico = 'Seleccione origen étnico';
  if (datos.edad === '' || Number(datos.edad) < 0 || Number(datos.edad) > 120) {
    errores.edad = 'Edad debe estar entre 0 y 120';
  }
  if (!datos.sexo) errores.sexo = 'Seleccione sexo';
  if (!datos.departamento) errores.departamento = 'Seleccione departamento';
  if (!datos.municipio) errores.municipio = 'Seleccione municipio';
  if (!datos.hospital) errores.hospital = 'Seleccione hospital';
  if (!datos.servicio) errores.servicio = 'Seleccione servicio';

  if (datos.email_contacto && !/^\S+@\S+\.\S+$/.test(datos.email_contacto)) {
    errores.email_contacto = 'Correo inválido';
  }

  return errores;
};

export const validarHorario = (ingreso, egreso) => {
  if (!ingreso || !egreso) return true;
  return egreso > ingreso;
};

export const validarPaso = ({ paso, store }) => {
  const { consentimiento, demograficos } = store;
  if (paso === 1) return consentimiento === true;
  if (paso === 2) return Object.keys(validarDemograficos(demograficos)).length === 0;
  return true;
};

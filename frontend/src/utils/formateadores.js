export const formatearServicio = (servicio) => {
  const map = {
    consulta_externa: 'Consulta Externa',
    emergencia: 'Emergencia',
    encamamiento: 'Encamamiento'
  };
  return map[servicio] || servicio;
};

export const formatearFecha = (fechaIso) => {
  if (!fechaIso) return '-';
  return new Date(fechaIso).toLocaleString('es-GT', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
};

export const formatearPorcentaje = (valor, total) => {
  if (!total) return '0%';
  return `${((valor / total) * 100).toFixed(1)}%`;
};

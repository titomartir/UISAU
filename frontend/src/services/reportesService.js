import api from './api';

export const reportesService = {
  /**
   * Obtiene datos de reportes filtrados por fechas
   */
  async obtenerDatosReportes(filtros = {}) {
    try {
      const { encuestaId, fechaInicio, fechaFin } = filtros;
      
      const params = new URLSearchParams();
      if (encuestaId) params.append('encuestaId', encuestaId);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/reportes/datos${queryString}`);
      
      return response.data;
    } catch (error) {
      console.error('Error en obtenerDatosReportes:', error);
      throw error;
    }
  },

  /**
   * Obtiene resumen de reportes
   */
  async obtenerResumenReportes(filtros = {}) {
    try {
      const { encuestaId, fechaInicio, fechaFin } = filtros;
      
      const params = new URLSearchParams();
      if (encuestaId) params.append('encuestaId', encuestaId);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/reportes/resumen${queryString}`);
      
      return response.data;
    } catch (error) {
      console.error('Error en obtenerResumenReportes:', error);
      throw error;
    }
  },

  async obtenerResumenMspas(filtros = {}) {
    try {
      const { fechaInicio, fechaFin } = filtros;

      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/reportes/mspas/resumen${queryString}`);

      return response.data;
    } catch (error) {
      console.error('Error en obtenerResumenMspas:', error);
      throw error;
    }
  },

  async exportarFormatoMspas(filtros = {}) {
    try {
      const { fechaInicio, fechaFin } = filtros;

      const response = await api.get('/reportes/mspas/export', {
        params: { fechaInicio, fechaFin },
        responseType: 'blob'
      });

      const disposition = response.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^\"]+)"?/i);
      const fileName = match ? match[1] : 'reporte_MSPAS.xlsx';

      return {
        blob: response.data,
        fileName,
        warningCount: Number(response.headers['x-mspas-warning-count'] || 0)
      };
    } catch (error) {
      console.error('Error en exportarFormatoMspas:', error);
      throw error;
    }
  }
};

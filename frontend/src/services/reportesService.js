import axios from 'axios';
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
  }
};

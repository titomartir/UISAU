import api from './api';

export const encuestaService = {
  async getEncuestaActiva() {
    const { data } = await api.get('/encuesta/activa');
    return data;
  },

  async enviarEncuesta(payload) {
    const { data } = await api.post('/encuesta/submit', payload);
    return data;
  }
};

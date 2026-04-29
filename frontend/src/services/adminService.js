import api from './api';

export const adminService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async getStats() {
    const { data } = await api.get('/admin/stats');
    return data;
  },

  async getRespuestas(params) {
    const { data } = await api.get('/admin/respuestas', { params });
    return data;
  },

  async getDetalle(id) {
    const { data } = await api.get(`/admin/respuestas/${id}`);
    return data;
  },

  async marcarRevisada(id) {
    const { data } = await api.patch(`/admin/respuestas/${id}/revisada`);
    return data;
  },

  async exportarRespuestas(params, formato = 'csv') {
    const { data } = await api.get('/admin/respuestas/export', {
      params: { ...params, formato },
      responseType: 'blob'
    });
    return data;
  }
};

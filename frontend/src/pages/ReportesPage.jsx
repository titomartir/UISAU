import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FiltrosReportes from '../components/reportes/FiltrosReportes';
import GraficoRespuesta from '../components/reportes/GraficoRespuesta';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { reportesService } from '../services/reportesService';
import { useAuthStore } from '../store/authStore';

function ReportesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtrosActivos, setFiltrosActivos] = useState(null);

  // Verificar autenticación
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    // Solo admin puede acceder
    if (user.rol !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Cargar datos de reportes
  const cargarReportes = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportesService.obtenerDatosReportes(filtros);
      setDatos(response);
      setFiltrosActivos(filtros);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      
      if (err.response?.status === 401) {
        clearAuth();
        navigate('/admin/login');
      } else {
        setError(err.response?.data?.error || 'Error al cargar reportes');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar reportes iniciales
  useEffect(() => {
    if (user?.rol === 'admin') {
      cargarReportes();
    }
  }, [user]);

  if (!user || user.rol !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Encuestas</h1>
          <p className="text-gray-600 mt-2">
            Visualiza gráficos y estadísticas de las respuestas de encuestas
          </p>
        </div>

        {/* Filtros */}
        <FiltrosReportes onAplicarFiltros={cargarReportes} cargando={loading} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!loading && datos && (
          <>
            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-1">Total de respuestas</p>
                <p className="text-3xl font-bold text-blue-600">
                  {datos.estadisticas.totalRespuestas}
                </p>
              </div>

              {datos.estadisticas.distribucionPorServicio && datos.estadisticas.distribucionPorServicio.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium mb-2">Por servicio</p>
                  <div className="space-y-1">
                    {datos.estadisticas.distribucionPorServicio.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        <span className="capitalize font-semibold">{item.servicio}:</span> {item.total}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {datos.estadisticas.edadPromedio && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Edad promedio</p>
                  <p className="text-3xl font-bold text-green-600">
                    {datos.estadisticas.edadPromedio}
                  </p>
                </div>
              )}

              {filtrosActivos && (filtrosActivos.fechaInicio || filtrosActivos.fechaFin) && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium mb-1">Período reportado</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {filtrosActivos.fechaInicio && <span className="block">{filtrosActivos.fechaInicio}</span>}
                    {filtrosActivos.fechaFin && <span className="block">hasta {filtrosActivos.fechaFin}</span>}
                  </p>
                </div>
              )}
            </div>

            {/* Gráficos de preguntas */}
            {datos.preguntas && datos.preguntas.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Resultados por Pregunta</h2>
                {datos.preguntas.map((pregunta, idx) => (
                  <GraficoRespuesta key={pregunta.id} pregunta={pregunta} numero={idx + 1} />
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800">
                  No hay datos para mostrar. Intenta con diferentes filtros.
                </p>
              </div>
            )}
          </>
        )}

        {!loading && !datos && !error && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-600">
              Selecciona un rango de fechas para ver los reportes
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ReportesPage;

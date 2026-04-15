import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FiltrosBusqueda from '../components/admin/FiltrosBusqueda';
import TablaRespuestas from '../components/admin/TablaRespuestas';
import BotonExportar from '../components/admin/BotonExportar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/authStore';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingExport, setLoadingExport] = useState(false);
  const [filtros, setFiltros] = useState({ page: 1, limit: 20 });
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargarStats = async () => {
    const data = await adminService.getStats();
    setStats(data.stats);
  };

  const cargarRespuestas = async (params = filtros) => {
    const data = await adminService.getRespuestas(params);
    setRespuestas(data.respuestas || []);
    setTotalPaginas(data.totalPaginas || 1);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([cargarStats(), cargarRespuestas()]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const onChangeFiltro = (campo, valor) => setFiltros((prev) => ({ ...prev, [campo]: valor, page: 1 }));

  const onBuscar = async () => {
    await cargarRespuestas(filtros);
  };

  const onLimpiar = async () => {
    const clean = { page: 1, limit: 20 };
    setFiltros(clean);
    await cargarRespuestas(clean);
  };

  const onCambiarPagina = async (page) => {
    if (page < 1 || page > totalPaginas) return;
    const next = { ...filtros, page };
    setFiltros(next);
    await cargarRespuestas(next);
  };

  const onVerDetalle = async (id) => {
    const data = await adminService.getDetalle(id);
    setDetalle(data.respuesta);
  };

  const onMarcarRevisada = async (id) => {
    await adminService.marcarRevisada(id);
    await Promise.all([cargarRespuestas(), cargarStats()]);
  };

  const onExportar = async () => {
    setLoadingExport(true);
    try {
      const blob = await adminService.exportarCSV(filtros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `encuestas_uisau_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setLoadingExport(false);
    }
  };

  const cerrarSesion = () => {
    clearAuth();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8">
        <section className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">Panel Administrativo</h1>
            <p className="text-sm text-brand-800">Usuario: {user?.email}</p>
          </div>
          <button className="btn-secondary" onClick={cerrarSesion}>Cerrar sesión</button>
        </section>

        {loading && <LoadingSpinner label="Cargando dashboard..." />}

        {!loading && stats && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="card-surface p-4"><p className="text-sm">Total respuestas</p><p className="text-2xl font-bold">{stats.totalRespuestas}</p></article>
            <article className="card-surface p-4"><p className="text-sm">Última semana</p><p className="text-2xl font-bold">{stats.ultimaSemana}</p></article>
            <article className="card-surface p-4"><p className="text-sm">Promedio satisfacción</p><p className="text-2xl font-bold">{stats.promedioSatisfaccion ?? '-'}</p></article>
            <article className="card-surface p-4"><p className="text-sm">Recomendación Sí</p><p className="text-2xl font-bold">{stats.recomendacion?.si ?? 0}</p></article>
          </section>
        )}

        <FiltrosBusqueda filtros={filtros} onChange={onChangeFiltro} onBuscar={onBuscar} onLimpiar={onLimpiar} />

        <div className="flex justify-end">
          <BotonExportar onClick={onExportar} loading={loadingExport} />
        </div>

        <TablaRespuestas
          respuestas={respuestas}
          loading={loading}
          onVerDetalle={onVerDetalle}
          onMarcarRevisada={onMarcarRevisada}
          paginaActual={filtros.page || 1}
          totalPaginas={totalPaginas}
          onCambiarPagina={onCambiarPagina}
        />

        {detalle && (
          <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
            <div className="card-surface max-h-[85vh] w-full max-w-4xl overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Detalle respuesta #{detalle.id}</h2>
                <button className="btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button>
              </div>
              <div className="mb-4 grid gap-2 sm:grid-cols-2">
                <p><strong>Hospital:</strong> {detalle.hospital}</p>
                <p><strong>Servicio:</strong> {detalle.servicio}</p>
                <p><strong>Departamento:</strong> {detalle.departamento}</p>
                <p><strong>Municipio:</strong> {detalle.municipio}</p>
              </div>
              <div className="space-y-2">
                {detalle.detalles?.map((d) => (
                  <article key={d.id} className="rounded-lg border border-brand-100 p-3">
                    <p className="font-semibold">{d.Pregunta?.texto_pregunta}</p>
                    <p>{d.opcion?.valor_texto || d.respuesta_texto || '-'}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default AdminDashboardPage;

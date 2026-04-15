import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1.2fr_1fr]">
        <section className="card-surface p-8">
          <p className="mb-2 inline-block rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700">
            Red de Hospitales Nacionales
          </p>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-brand-900">
            Encuesta de Satisfacción UISAU
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-brand-800">
            Ayúdenos a mejorar la calidad de atención en los servicios de salud.
            Su respuesta es anónima, confidencial y toma menos de 8 minutos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/encuesta" className="btn-primary">Iniciar encuesta</Link>
            <Link to="/admin/login" className="btn-secondary">Ingresar a panel admin</Link>
          </div>
        </section>

        <section className="card-surface p-6">
          <h2 className="mb-4 text-2xl font-bold text-brand-800">Qué incluye</h2>
          <ul className="space-y-2 text-brand-900">
            <li>10 pasos guiados con validaciones</li>
            <li>Secciones condicionales según servicio recibido</li>
            <li>Panel administrativo con filtros y exportación CSV</li>
            <li>Seguridad con JWT y datos sensibles encriptados</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;

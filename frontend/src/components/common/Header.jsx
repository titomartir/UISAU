import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function Header() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
  };

  const isAdmin = user?.rol === 'admin';

  return (
    <header className="border-b border-brand-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-heading text-xl font-bold text-brand-800">
          UISAU Encuestas
        </Link>
        <nav className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Link to="/admin" className="btn-secondary text-sm">
                Dashboard
              </Link>
              <Link to="/admin/reportes" className="btn-secondary text-sm">
                Reportes
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Cerrar sesión
              </button>
            </>
          )}
          {!isAdmin && (
            <>
              <Link to="/encuesta" className="btn-secondary text-sm">
                Responder encuesta
              </Link>
              <Link to="/admin/login" className="btn-primary text-sm">
                Panel admin
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

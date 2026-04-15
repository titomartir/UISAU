import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="border-b border-brand-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-heading text-xl font-bold text-brand-800">
          UISAU Encuestas
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/encuesta" className="btn-secondary text-sm">Responder encuesta</Link>
          <Link to="/admin/login" className="btn-primary text-sm">Panel admin</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;

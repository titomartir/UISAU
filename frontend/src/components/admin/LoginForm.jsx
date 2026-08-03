import { useState } from 'react';

function LoginForm({ onSubmit, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface mx-auto max-w-md space-y-4 p-6">
      <h2 className="text-center text-2xl font-bold text-brand-800">Ingreso administrador</h2>

      <label className="flex flex-col gap-1">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border p-2"
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border p-2"
          required
        />
      </label>

      {error && <p className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Validando...' : 'Entrar'}
      </button>
    </form>
  );
}

export default LoginForm;

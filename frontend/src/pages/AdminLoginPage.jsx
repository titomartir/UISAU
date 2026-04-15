import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoginForm from '../components/admin/LoginForm';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/authStore';

function AdminLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.login(email, password);
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      });
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
      </main>
      <Footer />
    </div>
  );
}

export default AdminLoginPage;

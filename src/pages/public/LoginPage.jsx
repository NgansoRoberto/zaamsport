import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Button from '../../components/common/Button';
import { useAuth } from '../../Contexts/AuthContext';
import { apiFetch, buildSessionFromAuthResponse, getRoleDashboardPath } from '../../hooks/API';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(buildSessionFromAuthResponse(data, email));
      navigate(getRoleDashboardPath(data.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Connexion</h1>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={submitting}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-sm">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={submitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          <p className="text-center text-gray-600 mt-4 text-sm">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-red-600 hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
